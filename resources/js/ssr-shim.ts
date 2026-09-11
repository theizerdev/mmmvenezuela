if (typeof globalThis.window === 'undefined') {
    const noop = () => {};
    const win: any = {
        addEventListener: noop,
        removeEventListener: noop,
        dispatchEvent: () => true,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        requestAnimationFrame: (cb: any) => setTimeout(cb, 16),
        cancelAnimationFrame: (id: any) => clearTimeout(id),
        navigator: { userAgent: 'node' },
        location: { href: '', protocol: 'http:', host: 'localhost' },
        getComputedStyle: () => ({
            getPropertyValue: () => '',
        }),
        document: {
            createElement: () => ({
                getContext: () => null,
                style: {},
                setAttribute: noop,
                removeAttribute: noop,
                appendChild: noop,
                removeChild: noop,
                addEventListener: noop,
                removeEventListener: noop,
            }),
            createElementNS: () => ({
                style: {},
                setAttribute: noop,
                appendChild: noop,
            }),
            documentElement: { style: {} },
            head: { appendChild: noop, removeChild: noop },
            body: { appendChild: noop, removeChild: noop, style: {} },
            getElementById: () => null,
            getElementsByTagName: () => [],
            querySelector: () => null,
            querySelectorAll: () => [],
        },
    };
    (globalThis as any).window = win;
    (globalThis as any).document = win.document;
    (globalThis as any).navigator = win.navigator;
    (global as any).window = win;
    (global as any).document = win.document;
    (global as any).navigator = win.navigator;
}

export {};
