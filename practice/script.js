(function () {
  "use strict";

  const get = (target) => {
    return document.querySelector(target);
  };
  const getAll = (target) => {
    return document.querySelectorAll(target);
  };
  const API_URL = "http://localhost:3000/todos";
  const $todos = get(".todos");
  //요소 가져오기
  const $form = get(".todo_form");
  //input 박스 안의 입력한 값을 가져온다.
  const $todoInput = get(".todo_input");
  //-------페지이네이션------
  const $pagination = get(".pagination");
  const limit = 5;
  let currentPage = 7;
  const totalCount = 53;
  const pageCount = 5;
  const pagination = () => {
    let totalPage = Math.ceil(totalCount / limit);
    let pageGroup = Math.ceil(currentPage / pageCount);

    let lastNumber = pageGroup * pageCount;
    if (lastNumber > totalPage) {
      lastNumber = totalPage;
    }
    let firstNumber = lastNumber - (pageCount - 1);
    console.log(firstNumber);
    const next = lastNumber + 1;
    const prev = firstNumber - 1;

    let html = "";

    if (prev > 0) {
      html += "<button class='prev' data-fn='prev'>이전</button> ";
    }

    for (let i = firstNumber; i <= lastNumber; i++) {
      html += `<button class="pageNumber" id="page_${i}">${i}</button>`;
    }
    if (lastNumber < totalPage) {
      html += `<button class='next' data-fn='next'>다음</button>`;
    }

    $pagination.innerHTML = html;
    const $currentPageNumber = get(`.pageNumber#page_${currentPage}`);
    $currentPageNumber.style.color = "#9dc0e8";

    const $currentPageNumbers = document.querySelectorAll(".pagination button");
    $currentPageNumbers.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.fn === "prev") {
          currentPage = prev;
        } else if (button.dataset.fn === "next") {
          currentPage = next;
        } else {
          currentPage = button.innerText;
        }
        pagination();
        getTodos();
      });
    });
  };
  //-------------------------
  const createTodoElement = (item) => {
    const { id, content, completed } = item;
    const $todoItem = document.createElement("div");
    const isChecked = completed ? "checked" : "";
    $todoItem.classList.add("item");
    $todoItem.dataset.id = id;
    $todoItem.innerHTML = `
            <div class="content">
              <input
                type="checkbox"
                class='todo_checkbox' 
                ${isChecked}
              />
              <label>${content}</label>
              <input type="text" value="${content}" />
            </div>
            <div class="item_buttons content_buttons">
              <button class="todo_edit_button">
                <i class="far fa-edit"></i>
              </button>
              <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
            <div class="item_buttons edit_buttons">
              <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
              </button>
              <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
              </button>
            </div>
      `;
    return $todoItem;
  };
  const renderAllTodos = (todos) => {
    //초기화
    $todos.innerHTML = "";
    todos.forEach((item) => {
      const todoElment = createTodoElement(item);
      $todos.appendChild(todoElment);
    });
  };

  const getTodos = () => {
    fetch(`${API_URL}?_page=${currentPage}&_limit=${limit}`)
      .then((response) => response.json())
      .then((todos) => renderAllTodos(todos))
      .catch((error) => console.log(error));
  };

  const addTodo = (e) => {
    //여기서 새로고침이 일어나지 않게 한다
    e.preventDefault();
    //input으로 받은 값을 db.json파일로 보낸다
    const todo = {
      content: $todoInput.value,
      completed: false,
    };
    fetch(API_URL, {
      method: "POST",
      //json파일을 주고받을꺼기 때문에
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
      //전체 리스트를 다시 호출
    })
      .then(getTodos)
      //입력시 input 창 빈값으로 초기화.
      .then(() => {
        $todoInput.value = "";
        $todoInput.focus();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const toggleTodo = (e) => {
    if (e.target.className !== "todo_checkbox") return;
    const $item = e.target.closest(".item");
    const id = $item.dataset.id;
    const completed = e.target.checked;
    fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed }),
    })
      .then(getTodos)
      .catch((error) => console.error(error));
  };
  //submit으로 버튼을 생성하여 버튼 클릭 시 새로고침이 일어난다.
  const changeEditMode = (e) => {
    const $item = e.target.closest(".item");
    const $label = $item.querySelector("label");
    const $editInput = $item.querySelector('input[type="text"]');
    const $contentButtons = $item.querySelector(".content_buttons");
    const $editButtons = $item.querySelector(".edit_buttons");
    const value = $editInput.value;

    if (e.target.className === "todo_edit_button") {
      $label.style.display = "none";
      $editInput.style.display = "block";
      $contentButtons.style.display = "none";
      $editButtons.style.display = "block";
      $editInput.focus();
      $editInput.value = "";
      $editInput.value = value;
    }

    if (e.target.className === "todo_edit_cancel_button") {
      $label.style.display = "block";
      $editInput.style.display = "none";
      $contentButtons.style.display = "block";
      $editButtons.style.display = "none";
      $editInput.value = $label.innerText;
    }
  };
  const editTodo = (e) => {
    if (e.target.className !== "todo_edit_confirm_button") return;
    const $item = e.target.closest(".item");
    const id = $item.dataset.id;
    const $editInput = $item.querySelector('input[type="text"]');
    const content = $editInput.value;
    fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })
      .then(getTodos)
      .catch((error) => console.error(error));
  };
  const removeTodo = (e) => {
    if (e.target.className !== "todo_remove_button") return;
    const $item = e.target.closest(".item");
    const id = $item.dataset.id;
    fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    })
      .then(getTodos)
      .catch((error) => console.error(error));
  };
  const init = () => {
    window.addEventListener("DOMContentLoaded", () => {
      getTodos();
      pagination();
    });
    $form.addEventListener("submit", addTodo);
    $todos.addEventListener("click", toggleTodo);
    $todos.addEventListener("click", changeEditMode);
    $todos.addEventListener("click", editTodo);
    $todos.addEventListener("click", removeTodo);
  };
  init();
})();
