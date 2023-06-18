# chap 04 _ 타입 코드 처리하기

## if-else
if-else는 하드코딩된 결정으로 볼 수 있습니다.   
코드에서 하드코딩된 상수가 좋지 않느 ㄴ것처럼 하드코딩된 결정도 좋지 않습니다.   

me   
하드 코딩을 피하기 위해서 늦은바인딩(동적바인딩)을 통하여 조건을 만든다.   
enum대신 interface를 만들고 각 동작에 대해서 컴퍼넌트로 연결 하여 조건을 만들어 준다.   

```ts
interface Input
{
  isRight():boolean;
  isLeft():boolean;
  isUp():boolean;
  isDown():boolean;
}

class Right implements Input
{
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
