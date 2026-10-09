# Lil_Ago Arena Android

설치해서 실행하는 안드로이드 테스트 앱입니다. Android 8.0 이상에서 실행되며 기존 게임 서버에 연결합니다.

- 세로 화면, 앱 아이콘, 뒤로가기 확인창
- 앱 시작 시 음악 자동재생 허용, 전투 중 음악 중지, 앱을 나가면 음악 중지
- 앱 업데이트 없이 기존 웹 게임의 새 캐릭터와 밸런스 패치 반영
- 연결 오류 시 재시도, HTTPS 연결만 허용

## 빌드

Android SDK 35, Build Tools 35.0.0, JDK 17, Gradle 8.13이 필요합니다.

```sh
cd android
gradle testDebugUnitTest lintDebug assembleDebug
```

GitHub의 `Android APK` 작업도 같은 검사를 실행하고 서명된 테스트 APK를 출력합니다.

이 앱은 인터넷 연결이 필요합니다. 앱 데이터는 브라우저 데이터와 별도이므로 처음 실행 시 웹 브라우저 계정이 자동으로 이전되지 않습니다. 앱을 삭제하거나 앱 데이터를 지우면 해당 기기의 로그인 정보도 지워집니다.
