package com.coffeetrack.game;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import android.view.View;
import android.view.ViewGroup;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Real-device WebView smoke test. No network or JavaScript-native bridge. */
public class GameSmokeInstrumentation extends Instrumentation {
    private WebView web;
    private WebView find(View view) {
        if (view instanceof WebView) return (WebView)view;
        if (view instanceof ViewGroup) {
            ViewGroup group=(ViewGroup)view;
            for (int i=0;i<group.getChildCount();i++) { WebView result=find(group.getChildAt(i)); if(result!=null)return result; }
        }
        return null;
    }
    private String js(String script) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);
        String[] value={null};
        runOnMainSync(()->web.evaluateJavascript(script, result->{value[0]=result;latch.countDown();}));
        if(!latch.await(10,TimeUnit.SECONDS))throw new AssertionError("WebView timed out");
        return value[0];
    }
    private void require(boolean ok,String message) { if(!ok)throw new AssertionError(message); }
    @Override public void onCreate(Bundle arguments) { super.onCreate(arguments);start(); }
    @Override public void onStart() {
        Bundle results=new Bundle();
        try {
            Activity activity=startActivitySync(new Intent(getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            runOnMainSync(()->web=find(activity.getWindow().getDecorView()));
            require(web!=null,"Game WebView missing");
            boolean ready=false;
            for(int i=0;i<100;i++){ if("true".equals(js("Boolean(window.coffeeTrack && document.querySelector('#start'))"))){ready=true;break;}Thread.sleep(100); }
            require(ready,"Game did not load");
            Thread.sleep(2000);
            js("document.querySelector('#start').click()");
            Thread.sleep(1000);
            for(int n=0;n<4;n++) {
                js("(()=>{const s=window.coffeeTrack.getState(); const c=s.customers.find(c=>c.id===s.selected); if(c){for(const id of c.order)document.querySelector('[data-food=\"'+id+'\"]').click();}})()");
                Thread.sleep(1500);
                js("document.querySelector('#serve').click()");
                Thread.sleep(1500);
            }
            require(Integer.parseInt(js("window.coffeeTrack.getState().served"))>=3,"Orders were not served");
            require(Integer.parseInt(js("window.coffeeTrack.getState().score"))>=450,"Score did not increase");
            js("document.querySelector('#pause').click()");
            String remaining=js("window.coffeeTrack.getState().remaining");
            Thread.sleep(500);
            require(remaining.equals(js("window.coffeeTrack.getState().remaining")),"Pause did not freeze shift");
            js("document.querySelector('#start').click()");
            results.putString("stream","PASS: real Android WebView loaded offline, served orders, awarded points and paused correctly.\n");
            finish(Activity.RESULT_OK,results);
        } catch(Throwable e) { results.putString("stream","FAIL: "+e.toString()+"\n");finish(Activity.RESULT_CANCELED,results); }
    }
}
