const mainEl = document.querySelector('main')
let formCount = 0 // the number of file forms that are currently rendered

// render one form by default
appendForm()

document.getElementById('add-file').addEventListener('click', appendForm)

function appendForm () {
  formCount += 1
  let form = document.createElement('form')
  form.id = 'add-file-form-' + formCount

  const formContent = `
    <label for="title">Title</label>
    <input name="title" placeholder="Title"/>
    <!-- TODO allow user to do any kind of file -->
    <input name="path" placeholder="Filename"/>
    <textarea></textarea>
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
