const marked = require('marked')

const formsEl = document.getElementById('forms-container')
const submitBtn = document.getElementById('submit')
let messageEl = document.getElementById('message')
let formCount = 0 // the number of file forms that are currently rendered

// render one form by default
appendForm()

submitBtn.addEventListener('click', createGist)
document.getElementById('add-file').addEventListener('click', appendForm)

async function createGist () {
  var fileForms = document.querySelectorAll('form')

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
      }
    }

    await archive.commit()
    // if not index.html
    await createPreviewPage(archive)
    window.location = archive.url
  } else renderMessage('Try adding some files!', 'info')
}

// TODO only do this if user didn't create an index.html
async function createPreviewPage (archive) {
  let previewHTML, filesListHTML, filesListItemsHTML  = ''

  // files are only ever added to top-level directory, so recursive readdir
  // is not necessary
  const files = await archive.readdir('/')

  const styles = `
    <style>
      *{box-sizing:border-box;}
      html{padding:50px 5px;}
      body{
        font-size:16px;
        margin:auto;
        max-width:500;
        font-family:BlinkMacSystemFont,'Helvetica Neue',sans-serif;
        line-height:1.4;
      }
      a{color:#0b51de;}
      ul{list-style:none;}
    </style>
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
        <main>
          ${filesListHTML}
        </main>
      </body>
    </html>
  `

  await archive.writeFile('/index.html', previewHTML)
  return

  // TODOrender a share thing if is owner
}

async function generateFilePreview (archive, path) {
  const file = await archive.readFile(path)

  return `<li>${file}</li>`

  // TODO only take the first few bytes
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

function renderMessage (msg, type) {
  messageEl.innerText = msg
  if (type) messageEl.classList.add(type)
  window.setTimeout(function () {
    messageEl.classList.remove('error')
    messageEl.innerText = ''
  }, 4000)
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

  textarea.classList.add('hidden')
  previewEl.innerHTML = marked(markdown)
  previewEl.classList.remove = ('hidden')

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