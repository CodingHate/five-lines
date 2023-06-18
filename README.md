# chap 04 \_ 타입 코드 처리하기

## if-else

if-else는 하드코딩된 결정으로 볼 수 있습니다.  
코드에서 하드코딩된 상수가 좋지 않느 ㄴ것처럼 하드코딩된 결정도 좋지 않습니다.

me  
하드 코딩을 피하기 위해서 늦은바인딩(동적바인딩)을 통하여 조건을 만든다.  
enum대신 interface를 만들고 각 동작에 대해서 컴퍼넌트로 연결 하여 조건을 만들어 준다.

```ts
interface Input {
  isRight(): boolean;
  isLeft(): boolean;
  isUp(): boolean;
  isDown(): boolean;
}

class Right implements Input {
  isRight(): boolean {
    return true;
  }
  isLeft(): boolean {
    return false;
  }
  isUp(): boolean {
    return false;
  }
  isDown(): boolean {
    return false;
  }
}
```

늦은 바인딩은 다음과 같이 구현을 하였다.

```ts
window.addEventListener("keydown", (e) => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
```

page64

기존 Right, Left, Up, Down에 대해서 중복 된것이 있으므로 handle하나로 정리 함

```ts
interface Input {
  handle(): void;
}

class Right implements Input {
  handle() {
    moveHorizontal(1);
  }
}
```
