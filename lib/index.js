const marked = require('marked')
const escape = require('escape-html')

const formsEl = document.getElementById('forms-container')
const submitBtn = document.getElementById('submit')
let messageEl = document.getElementById('message')
let formCount = 0 // the number of file forms that are currently rendered

// render one form by default
appendForm()

detectUserAgent()

submitBtn.addEventListener('click', createGist)
document.getElementById('add-file').addEventListener('click', appendForm)

async function createGist () {
  var fileForms = document.querySelectorAll('form')
  var paths = []

  // basic check to see if files have content
  // TODO: this is not correct - imagine if user has 2 forms, content in one but
  // not the first.
  if (fileForms.length && fileForms[0].content.value) {
    var archive = await DatArchive.create({
      title: document.querySelector('input[name="title"]').value || '',
      description: document.querySelector('input[name="description"]').value || ''
    })

    // Figure out which files need to be added
    var fileForms = document.querySelectorAll('form')

    for (var i = 0; i < fileForms.length; i++) {
      var form = fileForms[i]
      var path = form.path.value
      var content = form.content.value

      if (path && content) {
        await archive.writeFile(path, content)
        paths.push(path)
      }
    }
    await archive.commit()

    // if the user didn't add an index.html, generate a preview page
    if (paths.indexOf('index.html') === -1) await createPreviewPage(archive)

    window.location = archive.url
  } else renderMessage('Try adding some files!', 'info', true)
}

async function createPreviewPage (archive) {
  let previewHTML, filesListHTML, filesListItemsHTML  = ''

  // files are only ever added to top-level directory, so recursive readdir
  // is not necessary
  const files = await archive.readdir('/')

  const styles = `
    <style>
      *{box-sizing:border-box;}
      html{padding:50px 10px;}
      body{
        font-size:16px;
        margin:auto;
        max-width:700px;
        font-family:BlinkMacSystemFont,'Helvetica Neue',sans-serif;
        line-height:1.4;
        color:#111;
      }
      a{color:#0b51de;}
      ul{list-style:none;padding-left:0;}
      .file-preview{
        font-size:.9rem;
        width:100%;
        position:relative;
        display:block;
        margin-bottom:1.5rem;
      }
      .preview {
        border-radius:3px 3px 0 0;
        border:1px solid #9e9e9e;
        padding:.3rem .4rem;
        font-family:Consolas, Monaco, 'Lucida Console', monospace;
        font-size:.8rem;
        margin:.5rem 0 1rem 0;
        max-height:200px;
        overflow-x:hidden;
        overflow-y:hidden;
        white-space:pre-wrap;
      }
      .preview.markdown{
        font-family:BlinkMacSystemFont,'Helvetica Neue',sans-serif;
      }
      .preview.more-lines{padding-bottom:24px;max-height:235px;}
      .preview.more-lines.expanded{max-height:none;}
      .preview-toggle-expand{
        position:absolute;
        bottom:0;
        left:0;
        padding:.1rem 0.4rem;
        font-size:.8rem;
        color:#9e9e9e;
        border:1px solid #9e9e9e;
        border-radius:0 0 3px 3px;
        width:100%;
        background:#f4f6ff;
        cursor:pointer;
        text-decoration:none;
        font-family:Consolas,Monaco,'Lucida Console', monospace;
      }
      .preview-toggle-expand.hidden{visibility:hidden;}
      .preview-toggle-expand:hover{color:#525252;}
      </style>
      `

      const js = `
      <script>
      var toggles = document.querySelectorAll('.preview-toggle-expand')
      toggles.forEach(function (toggle) {
        toggle.addEventListener('click', toggleExpand)
      })

      function toggleExpand (e) {
        var previewId = e.target.dataset.preview
        var preview = document.getElementById(previewId)

        var collapseSelector = '[data-preview="' + previewId + '"].collapse'
        var collapseBtn = document.querySelector(collapseSelector)

        var expandSelector = '[data-preview="' + previewId + '"].expand'
        var expandBtn = document.querySelector(expandSelector)

        collapseBtn.classList.toggle('hidden')
        expandBtn.classList.toggle('hidden')
        preview.classList.toggle('expanded')
      }
      </script>
      `

      for (let path of files) {
        filesListItemsHTML += await generateFilePreview(archive, path)
      }

      filesListHTML = `<ul>${filesListItemsHTML}</ul>`
      previewHTML = `
      <html lang="en">
        <head>
          <meta charset="utf-8">
          ${styles}
        </head>
        <body>
          <main>${filesListHTML}</main>
        ${js}
        </body>
      </html>
      `

    await archive.writeFile('/index.html', previewHTML)
    return

  // TODOrender a share thing if is owner
}

async function generateFilePreview (archive, path) {
  const file = await archive.readFile(path)
  const isMarkdown = path.endsWith('.md')
  let previewNote = ''

  let lines = file.split('\n')

  if (lines.length > 10) {
    previewNote = `
    <span data-preview="preview-${path.replace('.', '')}" class="preview-toggle-expand expand">
    + ${lines.length - 10} more lines...
    </span>
      <span data-preview="preview-${path.replace('.', '')}" class="preview-toggle-expand collapse hidden">
        - Less
      </span>`
  }

  return `
    <li class="file-preview">
      <a href=${path}>${path}</a>
      <pre id="preview-${path}" class="preview ${previewNote ? 'more-lines' : ''} ${isMarkdown ? 'markdown' : ''}">${isMarkdown ? marked(file) : escape(file.trim())}</pre>
      ${previewNote}
    </li>`
}

function appendForm () {
  formCount += 1
  let form = document.createElement('form')
  form.id = 'add-file-form-' + formCount
  form.classList.add('file-form')

  var removeBtn = ''
  if (formCount !== 1) {
    var removeBtn = `
      <button type="button" class="remove" data-form=${form.id}>
        <span>Remove</span>
        <img src="/img/trash.png"/>
      </button>`
  }
  var textarea = `<textarea name="content" data-form=${form.id}></textarea>`
  var markdownPreview = `<p id="markdown-preview-${form.id}" class="markdown-preview hidden"></p>`

  const formContent = `
    <!-- TODO allow user to do any kind of file -->
    <div class="header">
      <input autofocus data-form=${form.id} name="path" placeholder="Filename including extension"/>
      <button type="button" id="preview-markdown-btn-${form.id}" data-form=${form.id} class="preview-markdown-btn markdown"></button>
      <button type="button" id="edit-btn-${form.id}" data-form=${form.id} class="edit-btn"></button>
      ${removeBtn}
    </div>
    ${textarea}
    ${markdownPreview}
  `

  form.innerHTML = formContent
  formsEl.appendChild(form)

  var previewMarkdownBtn = document.getElementById(`preview-markdown-btn-${form.id}`)
  var editBtn = document.getElementById(`edit-btn-${form.id}`)

  previewMarkdownBtn.addEventListener('click', previewMarkdown)
  editBtn.addEventListener('click', showTextarea)

  try {
    var pathInput = document.querySelector(`input[data-form=${form.id}`)
    var removeBtn = document.querySelector(`button.remove[data-form=${form.id}`)

    pathInput.addEventListener('keyup', function (e) {
      if (e.target.value.endsWith('.md')) {
        renderPreviewMarkdownBtn(form.id)
      } else {
        editBtn.innerHTML = ''
        previewMarkdownBtn.innerHTML = ''
      }
    })
    removeBtn.addEventListener('click', removeForm)
  } catch (_) {}
}

function removeForm (e) {
  const form = document.getElementById(e.target.parentElement.dataset.form)
  formsEl.removeChild(form)
}

function renderMessage (msg, type, timeout) {
  messageEl.innerText = msg
  if (type) messageEl.classList.add(type)

  if (timeout) {
    window.setTimeout(function () {
      messageEl.classList.remove('error')
      messageEl.innerText = ''
    }, 4000)
  }
}

function renderPreviewMarkdownBtn (id) {
  var previewMarkdownBtn = document.getElementById(`preview-markdown-btn-${id}`)
  var editBtn = document.getElementById(`edit-btn-${id}`)

  previewMarkdownBtn.innerHTML = '<span>Preview</span><img src="/img/eye.png"/>'
}

function previewMarkdown (e) {
  var previewBtn = e.target.parentElement
  var previewEl = document.getElementById(`markdown-preview-${previewBtn.dataset.form}`)
  var form = document.getElementById(previewBtn.dataset.form)
  var textarea = form.content
  var markdown = textarea.value
  var editBtn = document.getElementById(`edit-btn-${form.id}`)

  previewEl.innerHTML = marked(markdown)
  textarea.classList.add('hidden')
  previewEl.classList.remove('hidden')

  editBtn.innerHTML = '<span>Edit</span><img src="/img/pencil.png"/>'
  previewBtn.innerHTML = ''
}

function showTextarea (e) {
  var editBtn = e.target.parentElement // TODO
  var form = document.getElementById(editBtn.dataset.form)
  var textarea = form.content
  var previewEl = document.getElementById(`markdown-preview-${editBtn.dataset.form}`)

  editBtn.innerHTML = ''
  renderPreviewMarkdownBtn(editBtn.dataset.form)
  previewEl.classList.add('hidden')
  textarea.classList.remove('hidden')
  textarea.focus()
}

function detectUserAgent () {
  if (navigator.userAgent.includes('BeakerBrowser')) {
    // enable form
    document.querySelectorAll('[disabled]').forEach(function (el) {
      el.disabled = false
    })
  } else {
    renderMessage('Sorry, PasteDat only works in the Beaker browser.', 'error', false)
  }
}