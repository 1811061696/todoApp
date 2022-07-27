class Model {
    constructor() {
      this.todos = [
        {
            id: 1,
            text: "React js",
            complete: false
        },
        {
            id: 2,
            text: "Javascript",
            complete: false
        },
    ],
      this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }
  

    // model phản hồi lại controller
    bindTodoListChanged(callback) {
      this.onTodoListChanged = callback
    }
  
    // lưu giá trị vào localStorage
    _commit(todos) {
      this.onTodoListChanged(todos)
      localStorage.setItem('todos', JSON.stringify(todos))
    }
  

    // Tao phương thức thêm todo
    addTodo(todoText) {
      const todo = {
        // kiểm tra todos.length > 0 --> id mới = id cũ + 1 ngược lại thì id = 1
        id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
        text: todoText,
        complete: false,
      }
  
      this.todos.push(todo)// thêm todo mới vào mảng todos
  
      this._commit(this.todos)
    }
  
    // tạo phương thức sửa todo
    editTodo(id, updatedText) {
      this.todos = this.todos.map(todo =>
        // kiểm tra id đúng thì sửa sai thì trả về todo cũ (toán tử 3 ngôi)
        todo.id === id ? 
          { 
            id: todo.id, 
            text: updatedText, 
            complete: todo.complete 
          } 
          : todo
      )
  
      this._commit(this.todos)
    }
  

    // tạo phương thức xóa todo
    deleteTodo(id) {
      // lọc các todo có id!== id --> trả về một mảng mới
      this.todos = this.todos.filter(todo => todo.id !== id)
  
      this._commit(this.todos)
    }
  
    // Thay đổi trạng thái todo
    toggleTodo(id) {
      this.todos = this.todos.map(todo =>
        todo.id === id ? 
        { 
            id: todo.id, 
            text: todo.text, 
            complete: !todo.complete // thay đổi trạng thái của todo
        } : todo
      )
  
      this._commit(this.todos)
    }
  }
  
  


  class View {
    constructor() {
      // lấy ra gốc của dự án
      this.app = this.getElement('#root')

      // tạo form hiển thị todo
      this.form = this.createElement('form')

      // tạo thẻ input (nhập todo mới)
      this.input = this.createElement('input')
      this.input.type = 'text'
      this.input.placeholder = 'Add todo'
      this.input.name = 'todo'

      // tạo button thêm
      this.submitButton = this.createElement('button')
      this.submitButton.textContent = 'Thêm'

      this.form.append(this.input, this.submitButton)

      //tạo header của ứng dụng
      this.title = this.createElement('h1')
      this.title.textContent = 'Todos'

      // tạo danh sách hiển thị todo
      this.todoList = this.createElement('ul', 'todo-list')
      this.app.append(this.title, this.form, this.todoList)
  

      
      this._temporaryTodoText = ''
      this._initLocalListeners()
    }
  

    // lấy value được nhập vào khi thêm
    get _todoText() {
      return this.input.value  
    }
  
    // clear input
    _resetInput() {
      this.input.value = ''
    }
  
    // tạo element mới
    createElement(tag, className) {
      const element = document.createElement(tag)
  
      if (className) element.classList.add(className)
  
      return element
    }
  

    // lấy ra các phàn tử trong DOM
    getElement(selector) {
      const element = document.querySelector(selector)
  
      return element
    }
  
    displayTodos(todos) {
      // xóa tất cả các nút
      while (this.todoList.firstChild) {
        this.todoList.removeChild(this.todoList.firstChild) // xóa tất cả các con của todoList
      }
  
      // hiển thị thống báo khi không có todo nào
      if (todos.length === 0) {
        const p = this.createElement('p')
        p.textContent = 'Chưa có công việc nào! Thêm công việc?'
        this.todoList.append(p)
      } else {
        // tạo thẻ hiển thị todo
        todos.forEach(todo => {
          const li = this.createElement('li')
          li.id = todo.id
  
          // tạo nút ckeckbox kiểm soát tiến độ công việc
          const checkbox = this.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.checked = todo.complete
  
          // tạo thẻ chứa nội dung của todo
          const span = this.createElement('span')
          span.contentEditable = true  // thuộc tính hỗ trợ việc chỉnh sửa văn bản
          span.classList.add('editable')
  

          // gạch bỏ todo nếu nó đã hoàn thành
          if (todo.complete) {
            const strike = this.createElement('s') // tạo thẻ gạch ngang nội dung
            strike.textContent = todo.text
            span.append(strike)
          } else {
            span.textContent = todo.text
          }
  

          // tạo nút xóa cho todo
          const deleteButton = this.createElement('button', 'delete')
          deleteButton.textContent = 'Xóa'
          li.append(checkbox, span, deleteButton)
  
          
          this.todoList.append(li)
        })
      }
  
    }
  

    // Bắt sự kiện khi thay đổi value của todo
    _initLocalListeners() {
      this.todoList.addEventListener('input', event => {
        if (event.target.className === 'editable') {
          this._temporaryTodoText = event.target.innerText
        }
      })
    }
  

    // bắt sự kiện nút Add
    bindAddTodo(handler) {
      this.form.addEventListener('submit', event => {
        event.preventDefault()
  
        if (this._todoText) {
          handler(this._todoText)
          this._resetInput()
        }
      })
    }
  

    // bắt sự kiện click nút xóa
    bindDeleteTodo(handler) {
      this.todoList.addEventListener('click', event => {
        if (event.target.className === 'delete') {
          const id = parseInt(event.target.parentElement.id)
  
          handler(id)
        }
      })
    }
  

    // bắt sự kiện khi sửa todo
    bindEditTodo(handler) {
      this.todoList.addEventListener('focusout', event => {
        if (this._temporaryTodoText) {
          const id = parseInt(event.target.parentElement.id)
  
          handler(id, this._temporaryTodoText)
          this._temporaryTodoText = ''
        }
      })
    }
  
    // bắt sự kiện khi click vào các nút ckeckbox
    bindToggleTodo(handler) {
      this.todoList.addEventListener('change', event => {
        if (event.target.type === 'checkbox') {
          const id = parseInt(event.target.parentElement.id)
  
          handler(id) // callback
        }
      })
    }
  }
  
  
  class Controller {
    constructor(model, view) {
      this.model = model
      this.view = view
  
       // hiển thị các todo ban đầu
      this.model.bindTodoListChanged(this.onTodoListChanged)


      this.view.bindAddTodo(this.handleAddTodo)
      this.view.bindEditTodo(this.handleEditTodo)
      this.view.bindDeleteTodo(this.handleDeleteTodo)
      this.view.bindToggleTodo(this.handleToggleTodo)
  
      // Display initial todos
      this.onTodoListChanged(this.model.todos)
    }
  
    // sử lý hiện các todo
    onTodoListChanged = todos => {
      this.view.displayTodos(todos)
    }
  
    // sử lý add todo
    handleAddTodo = todoText => {
      this.model.addTodo(todoText)
    }
  
    // sử lý sửa todo
    handleEditTodo = (id, todoText) => {
      this.model.editTodo(id, todoText)
    }
  

    // sử lý xóa todo
    handleDeleteTodo = id => {
      this.model.deleteTodo(id)
    }
  
    // sử lý thay đổi trạng thái todo
    handleToggleTodo = id => {
      this.model.toggleTodo(id)
    }
  }
  
  const app = new Controller(new Model(), new View())
  