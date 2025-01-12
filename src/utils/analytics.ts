type AnalyticsParams = {
    value?: number;
    event_label?: string;
    custom_metrics?: { [key: string]: any };
    user_id?: string;
    [key: string]: any;
};

export const Analytics = {
    // Game Flow Events
    gameStart() {
        this.sendEvent('game_flow', 'game_start');
    },

    gameEnd(score: number, maxValue: number) {
        this.sendEvent('game_flow', 'game_end', {
            value: score,
            custom_metrics: {
                max_value: maxValue
            }
        });
    },

    tutorialStart() {
        this.sendEvent('tutorial', 'start');
    },

    tutorialComplete() {
        this.sendEvent('tutorial', 'complete');
    },

    tutorialSkip() {
        this.sendEvent('tutorial', 'skip');
    },

    // Game Actions
    combineSides(value: number) {
        this.sendEvent('game_action', 'combine_sides', {
            value: value
        });
    },

    rotateCube(direction: string) {
        this.sendEvent('game_action', 'rotate', {
            event_label: direction
        });
    },

    useIncrement() {
        this.sendEvent('game_action', 'use_increment');
    },

    // User Properties
    setUserProperties(properties: { [key: string]: any }) {
        gtag('set', 'user_properties', properties);
    },

    // Helper method to send events
    sendEvent(category: string, action: string, params: AnalyticsParams = {}) {
        const username = window.Telegram.WebApp.initDataUnsafe.user?.username || 'unknown';
        gtag('event', action, {
            ...params,
            event_category: category,
            user_id: username,
            platform: 'web'
        });
    },

    // Tutorial Steps
    tutorialStep(step: number, action: string) {
        this.sendEvent('tutorial', `step_${step}`, {
            event_label: action
        });
    },
};

// Declare gtag for TypeScript
declare global {
    function gtag(...args: any[]): void;
} 