package com.coffeetrack.game;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.view.WindowInsets;
import android.os.Build;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView game;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(37, 59, 48));
        getWindow().setNavigationBarColor(Color.rgb(37, 59, 48));
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(246, 240, 228));
        game.getSettings().setJavaScriptEnabled(true);
        game.getSettings().setDomStorageEnabled(true);
        game.getSettings().setAllowFileAccess(false);
        game.getSettings().setAllowContentAccess(false);
        game.setWebViewClient(new WebViewClient() {
            @Override public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, android.webkit.WebResourceRequest request) {
                android.net.Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !"game.coffeetrack.local".equals(uri.getHost())) return new android.webkit.WebResourceResponse("text/plain", "UTF-8", new java.io.ByteArrayInputStream(new byte[0]));
                String path = uri.getPath();
                String file = "/".equals(path) ? "index.html" : path.substring(1);
                if (!file.matches("[a-zA-Z0-9._-]+")) return null;
                String mime = file.endsWith(".js") ? "application/javascript" : file.endsWith(".css") ? "text/css" : "text/html";
                try { return new android.webkit.WebResourceResponse(mime, "UTF-8", getAssets().open(file)); }
                catch (java.io.IOException e) { return new android.webkit.WebResourceResponse("text/plain", "UTF-8", new java.io.ByteArrayInputStream(new byte[0])); }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, android.webkit.WebResourceRequest request) { return true; }
        });
        // Keep the game outside Android 15 system bars and display cutouts.
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(Color.rgb(37, 59, 48));
        container.addView(game, new FrameLayout.LayoutParams(-1, -1));
        container.setOnApplyWindowInsetsListener((view, insets) -> {
            int left, top, right, bottom;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                left=bars.left; top=bars.top; right=bars.right; bottom=bars.bottom;
            } else {
                left=insets.getSystemWindowInsetLeft(); top=insets.getSystemWindowInsetTop();
                right=insets.getSystemWindowInsetRight(); bottom=insets.getSystemWindowInsetBottom();
            }
            view.setPadding(left, top, right, bottom);
            return insets.consumeSystemWindowInsets();
        });
        setContentView(container);
        container.requestApplyInsets();
        game.loadUrl("https://game.coffeetrack.local/");
    }
    @Override protected void onPause() { super.onPause(); game.evaluateJavascript("window.coffeeTrack && window.coffeeTrack.pause()", null); game.onPause(); }
    @Override protected void onResume() { super.onResume(); if (game != null) game.onResume(); }
    @Override protected void onDestroy() { if (game != null) game.destroy(); super.onDestroy(); }
}
