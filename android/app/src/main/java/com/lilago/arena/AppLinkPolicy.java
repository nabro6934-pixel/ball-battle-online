package com.lilago.arena;

import java.net.URI;

final class AppLinkPolicy {
    static final String GAME_URL = "https://ball-battle-online-john.onrender.com/";
    static boolean trusted(String value) {
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme())
                && "ball-battle-online-john.onrender.com".equalsIgnoreCase(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443)
                && uri.getUserInfo() == null;
        } catch (IllegalArgumentException error) { return false; }
    }
    private AppLinkPolicy() { }
}
