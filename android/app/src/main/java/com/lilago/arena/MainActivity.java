package com.lilago.arena;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private WebView game;
    private LinearLayout connection;
    private TextView message;
    private ProgressBar progress;
    private Button retry;
    private boolean foreground;
    private boolean loadFailed;

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(16, 29, 54));
        root.setFitsSystemWindows(true);
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        }
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(16, 29, 54));
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setUserAgentString(settings.getUserAgentString() + " LilAgoArenaAndroid/1.0");
        game.setWebChromeClient(new WebChromeClient());
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String target = request.getUrl().toString();
                if (AppLinkPolicy.trusted(target)) return false;
                if (request.isForMainFrame() && request.hasGesture()
                    && "https".equalsIgnoreCase(request.getUrl().getScheme())) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl())
                            .addCategory(Intent.CATEGORY_BROWSABLE));
                    } catch (ActivityNotFoundException ignored) {
                        Toast.makeText(MainActivity.this, "링크를 열 수 없어요.", Toast.LENGTH_SHORT).show();
                    }
                }
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!AppLinkPolicy.trusted(url) || loadFailed) return;
                connection.setVisibility(View.GONE);
                syncMusic();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showError("인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                showError("서버에 안전하게 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
                if (request.isForMainFrame()) showError("서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
            }
        });
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));
        connection = new LinearLayout(this);
        connection.setGravity(Gravity.CENTER);
        connection.setOrientation(LinearLayout.VERTICAL);
        connection.setPadding(32, 32, 32, 32);
        connection.setBackgroundColor(Color.rgb(16, 29, 54));
        TextView title = new TextView(this);
        title.setText("Lil_Ago Arena");
        title.setTextColor(Color.rgb(255, 202, 88));
        title.setTextSize(30);
        title.setGravity(Gravity.CENTER);
        connection.addView(title);
        message = new TextView(this);
        message.setTextColor(Color.WHITE);
        message.setTextSize(16);
        message.setGravity(Gravity.CENTER);
        message.setPadding(0, 24, 0, 24);
        connection.addView(message);
        progress = new ProgressBar(this);
        connection.addView(progress);
        retry = new Button(this);
        retry.setText("다시 연결하기");
        retry.setOnClickListener(view -> loadGame());
        connection.addView(retry);
        root.addView(connection, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (saved == null || game.restoreState(saved) == null) loadGame();
        else connection.setVisibility(View.GONE);
    }

    private void loadGame() {
        loadFailed = false;
        connection.setVisibility(View.VISIBLE);
        message.setText("Season 1 · 게임에 연결하는 중…");
        progress.setVisibility(View.VISIBLE);
        retry.setVisibility(View.GONE);
        game.loadUrl(AppLinkPolicy.GAME_URL);
    }
    private void showError(String text) {
        loadFailed = true;
        connection.setVisibility(View.VISIBLE);
        message.setText(text);
        progress.setVisibility(View.GONE);
        retry.setVisibility(View.VISIBLE);
    }
    private void syncMusic() {
        if (game == null) return;
        game.evaluateJavascript(foreground
            ? "if(window.arenaLobbyMusic){window.arenaLobbyMusic.setScreen((document.body&&document.body.dataset.screen)||'home');}"
            : "if(window.arenaLobbyMusic){window.arenaLobbyMusic.setLobby(false);}", null);
    }
    @Override protected void onResume() {
        super.onResume();
        foreground = true;
        if (game != null) { game.onResume(); syncMusic(); }
    }
    @Override protected void onPause() {
        foreground = false;
        syncMusic();
        if (game != null) game.onPause();
        super.onPause();
    }
    @Override protected void onSaveInstanceState(Bundle out) {
        if (game != null) game.saveState(out);
        super.onSaveInstanceState(out);
    }
    @Override protected void onDestroy() {
        if (game != null) { game.stopLoading(); game.destroy(); game = null; }
        super.onDestroy();
    }
    @SuppressWarnings("deprecation")
    @Override public void onBackPressed() {
        if (connection.getVisibility() == View.VISIBLE) { finish(); return; }
        game.evaluateJavascript("(function(){var modal=document.getElementById('socialModal');var close=document.getElementById('socialClose');if(modal&&!modal.classList.contains('hidden')&&close&&getComputedStyle(close).display!=='none'){close.click();return 'modal';}return document.body.dataset.screen||'home';})()", value -> {
            if ("\"modal\"".equals(value)) return;
            boolean home = "\"home\"".equals(value);
            new AlertDialog.Builder(this)
                .setMessage(home ? "게임을 종료할까요?" : "메인 메뉴로 돌아갈까요?")
                .setNegativeButton("계속하기", null)
                .setPositiveButton(home ? "종료" : "메인으로", (dialog, which) -> {
                    if (home) finish();
                    else game.evaluateJavascript("var b=document.getElementById('goHome');if(b)b.click();", null);
                }).show();
        });
    }
}
