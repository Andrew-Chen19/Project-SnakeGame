const canvas = document.getElementById("mycanvas");
//getContext() returns a drawing context on the canvas
const ctx = canvas.getContext("2d");

const unit = 20;
const row = canvas.height / unit;
const column = canvas.width / unit;

//array of objects
//物件的內容是儲存蛇的 X,Y 軸座標
let snake = [];
//設定蛇的初始位置 (第零項是頭，最後一項是尾)
//放進 function 裡，只是因為 code 會看起來比較乾淨
function createSnake() {
  snake[0] = {
    x: 60,
    y: 0,
  };
  snake[1] = {
    x: 40,
    y: 0,
  };
  snake[2] = {
    x: 20,
    y: 0,
  };
  snake[3] = {
    x: 0,
    y: 0,
  };
}
createSnake();

//製作果實
class Fruit {
  constructor() {
    //隨機生成果實的位置
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  //用來畫果實的函式
  drawFruit() {
    //填滿顏色
    ctx.fillStyle = "red";
    //填滿實心矩形
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  //用來更新果實位置的函式
  pickALocation() {
    let overlap;
    let new_x;
    let new_y;

    //確認重新選定的果實位置有沒有和蛇的身體重疊
    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          overlap = true;
          return;
        } else {
          overlap = false;
        }
      }
    }
    //do while loop 至少會執行一次
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkOverlap(new_x, new_y);
    } while (overlap);

    this.x = new_x;
    this.y = new_y;
  }
}
let myFruit = new Fruit();

//設定初始方向為右邊
let d = "Right";
//設定按了上下左右鍵，蛇該往哪移動
window.addEventListener("keydown", changeDirection);

// e => event
function changeDirection(e) {
  if (e.key == "ArrowUp" && d != "Down") {
    d = "Up";
  } else if (e.key == "ArrowDown" && d != "Up") {
    d = "Down";
  } else if (e.key == "ArrowLeft" && d != "Right") {
    d = "Left";
  } else if (e.key == "ArrowRight" && d != "Left") {
    d = "Right";
  }

  //按了上下左右鍵後，在下一幀被畫出來前
  //刪除監聽器，不接受任何 keydown 事件
  //防止連續點擊而產生的自殺bug
  window.removeEventListener("keydown", changeDirection);
}

//宣告最高分數的變數，並執行函式
//不直接 = 0 是因為 Storage，如果之前有玩過會記錄，一開始顯示的最高分數就不會是零
let highestScore;
loadHighestScore();
document.getElementById("highestscore").innerText = "最高分數：" + highestScore;
//設定初始分數
let score = 0;
document.getElementById("myscore").innerText = "遊戲分數：" + score;

function draw() {
  //每次畫圖前，確認蛇有沒有咬到自己的身體
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      alert("遊戲結束");
      //跳出 draw()，不讓其執行底下剩下的 code 而繼續畫圖
      return;
    }
  }

  //畫出其他東西前，先讓背景(重新)變成全黑色
  //這兩行如果不寫，每次更新時，蛇上一回所繪製的位置仍會存在
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //畫出果實
  myFruit.drawFruit();

  //設定蛇的顏色和外框顏色
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      ctx.fillStyle = "orange";
    } else {
      ctx.fillStyle = "palegreen";
    }
    //外框顏色
    ctx.strokeStyle = "white";

    //設定蛇穿牆
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    } else if (snake[i].x < 0) {
      snake[i].x = canvas.width - unit;
    } else if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    } else if (snake[i].y < 0) {
      snake[i].y = canvas.height - unit;
    }

    //畫出蛇
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    //僅有外框的空心矩形
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  //以目前的d變數方向，來決定下一幀數(頭)的位置
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (d == "Left") {
    snakeX -= unit;
  } else if (d == "Up") {
    snakeY -= unit;
  } else if (d == "Right") {
    snakeX += unit;
  } else if (d == "Down") {
    snakeY += unit;
  }
  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  //確認蛇是否有吃到果實
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    //有吃到果實
    //更新果實的位置
    myFruit.pickALocation();
    //更新分數
    score++;
    document.getElementById("myscore").innerText = "遊戲分數：" + score;
    //更新最高分數(如果分數大於最高分數)
    setHighestScore();
    document.getElementById("highestscore").innerText =
      "最高分數：" + highestScore;
  } else {
    //沒吃到果實
    //刪除最後一項物件
    snake.pop();
  }

  //新增一個物件在最前項(新的頭的位置)
  //有吃到果實，沒有刪除，有新增，所以長度會加一
  //沒吃到果實，有刪除，有新增，所以長度維持
  snake.unshift(newHead);

  //把刪除的監聽器加回來
  window.addEventListener("keydown", changeDirection);
}

//讓蛇動起來
let myGame = setInterval(draw, 50);

//載入最高分數
function loadHighestScore() {
  //session Storage 無紀錄時 (是放在 session，所以關閉瀏覽器記錄就會消失)
  //null if the key does not exist
  if (sessionStorage.getItem("highestScore" == null)) {
    highestScore = 0;
  } else {
    //session Storage 有紀錄時
    //由於 Storage 裡面儲存的 data type 都是 string
    //記得要轉換成 number
    highestScore = Number(sessionStorage.getItem("highestScore"));
  }
}

//更新最高分數
function setHighestScore() {
  if (score > highestScore) {
    //update key's value if it already exists
    sessionStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
