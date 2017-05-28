const mainEl = document.querySelector('main')
const submitBtn = document.getElementById('submit')
let formCount = 0 // the number of file forms that are currently rendered

// render one form by default
appendForm()

submitBtn.addEventListener('click', createGist)
document.getElementById('add-file').addEventListener('click', appendForm)

function createGist () {
  // Create a new archive
  // Get the title/desc if one exists
  var archive

  DatArchive.create({
    title: document.querySelector('input[name="title"]').value || '',
    description: document.querySelector('input[name="description"]').value || ''
  }).then(function (res) {
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
      .then(function (data) {
        archive.commit()
      })
  })
}

function appendForm () {
  formCount += 1
  let form = document.createElement('form')
  form.id = 'add-file-form-' + formCount

  const formContent = `
    <label for="title">Title</label>
    <input name="title" placeholder="Title"/>
    <!-- TODO allow user to do any kind of file -->
    <input name="path" placeholder="Filename"/>
    <textarea name="content"></textarea>
  `

  form.innerHTML = formContent

  if (formCount !== 1) {
    var removeBtn = document.createElement('button')
    removeBtn.innerText = 'X'
    removeBtn.dataset.form = form.id
    removeBtn.addEventListener('click', removeForm)
    form.appendChild(removeBtn)
  }
  mainEl.appendChild(form)
}

function removeForm (e) {
  const form = document.getElementById(e.target.dataset.form)
  mainEl.removeChild(form)
}
