const marked = require('marked')

const formsEl = document.getElementById('forms-container')
const submitBtn = document.getElementById('submit')
let messageEl = document.getElementById('message')
let formCount = 0 // the number of file forms that are currently rendered

// render one form by default
appendForm()

submitBtn.addEventListener('click', createGist)
document.getElementById('add-file').addEventListener('click', appendForm)

function createGist () {
  var archive
  DatArchive.create({
    title: document.querySelector('input[name="title"]').value || '',
    description: document.querySelector('input[name="description"]').value || ''
  })
    .then(function (res) {
      archive = res

      // Figure out which files need to be added
      var fileForms = document.querySelectorAll('form')
      var promises = []

      for (var i = 0; i < fileForms.length; i++) {
        var form = fileForms[i]
        var path = form.path.value
        var content = form.content.value

        if (path && content) {
          promises.push(archive.writeFile(path, content))
        }
      }

      Promise.all(promises)
        .then(function () {
          archive.commit()
          window.location = archive.url
        })
    })
    .catch(function (err) {
      console.error(err)
      renderMsg('Something went wrong', 'error')
    })
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
      <button type="button" class="preview-markdown-btn markdown"></button>
      ${removeBtn}
    </div>
    ${textarea}
    ${markdownPreview}
  `

  form.innerHTML = formContent
  formsEl.appendChild(form)

  try {
    var pathInput = document.querySelector(`input[data-form=${form.id}`)
    var removeBtn = document.querySelector(`button[data-form=${form.id}`)

    pathInput.addEventListener('keyup', addPreviewMarkdownBtn)
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

function addPreviewMarkdownBtn (e) {
  if (e.target.value.endsWith('.md')) {
    var previewMarkdownBtn = document.querySelector('.preview-markdown-btn')
    previewMarkdownBtn.dataset.form = e.target.dataset.form
    previewMarkdownBtn.innerText = 'Preview'
    previewMarkdownBtn.addEventListener('click', previewMarkdown)
  }
}

function previewMarkdown (e) {
  var previewEl = document.getElementById(`markdown-preview-${e.target.dataset.form}`)
  var form = document.getElementById(e.target.dataset.form)
  var textarea = form.content
  var markdown = textarea.value
  textarea.classList.add('hidden')
  previewEl.innerHTML = marked(markdown)
  previewEl.classList.remove = ('hidden')
}