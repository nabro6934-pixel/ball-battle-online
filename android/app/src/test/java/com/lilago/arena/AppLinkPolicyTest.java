package com.lilago.arena;

import org.junit.Test;
import static org.junit.Assert.*;

public class AppLinkPolicyTest {
    @Test public void gamePagesStayInsideApp() {
        assertTrue(AppLinkPolicy.trusted(AppLinkPolicy.GAME_URL));
        assertTrue(AppLinkPolicy.trusted(AppLinkPolicy.GAME_URL + "download"));
        assertTrue(AppLinkPolicy.trusted("https://ball-battle-online-john.onrender.com:443/"));
    }
    @Test public void lookalikesAndUnsafeSchemesAreNotTrusted() {
        for (String value : new String[] {"http://ball-battle-online-john.onrender.com/",
            "https://ball-battle-online-john.onrender.com.evil.example/",
            "https://evil.example/", "javascript:alert(1)", "file:///secret",
            "intent://test", "https://user@ball-battle-online-john.onrender.com/",
            "https://ball-battle-online-john.onrender.com:1234/", "invalid%url"}) {
            assertFalse(value, AppLinkPolicy.trusted(value));
        }
    }
}
