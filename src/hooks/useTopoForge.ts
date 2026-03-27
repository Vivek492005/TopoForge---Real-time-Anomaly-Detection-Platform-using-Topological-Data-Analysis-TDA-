import { useEffect, useRef, useState, useCallback } from 'react';

export interface AnalysisResult {
    betti_numbers: { h0: number; h1: number; h2: number };
    topology_features?: {
        entropy: number;
        total_lifetime: number;
    };
    scores?: {
        total: number;
        betti: number;
        entropy: number;
        ml: number;
    };
    anomaly_score: number;
    is_anomaly: boolean;
    security_analysis?: any;
    window_size: number;
}

export interface TopoForgeResponse {
    type: 'analysis';
    data: AnalysisResult;
    original_event: any;
}

export function useTopoForge(url: string = 'ws://localhost:8000/ws/stream') {
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

    // Only connect to backend WebSocket when running on localhost (not on GitHub Pages)
    const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

    const connect = useCallback(() => {
        if (!isLocalDev) return; // Skip WebSocket on production/GitHub Pages
        if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return;

        try {
            ws.current = new WebSocket(url);

            ws.current.onopen = () => {
                console.log('[TopoForge] Connected to AI Core');
                setIsConnected(true);
            };

            ws.current.onerror = () => {
                // Silently ignore - backend not running
                setIsConnected(false);
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                // Auto-reconnect after 5s only on localhost
                if (isLocalDev) {
                    setTimeout(() => {
                        if (ws.current?.readyState === WebSocket.CLOSED) {
                            connect();
                        }
                    }, 5000);
                }
            };

            ws.current.onmessage = (event) => {
                try {
                    const response: TopoForgeResponse = JSON.parse(event.data);
                    if (response.type === 'analysis') {
                        setLastAnalysis(response.data);
                    }
                } catch (e) {
                    // Silently ignore parse errors
                }
            };
        } catch (e) {
            // Silently ignore connection errors
        }
    }, [url, isLocalDev]);

    useEffect(() => {
        if (!isLocalDev) return; // Don't attempt connection on production
        connect();
        return () => {
            if (ws.current) {
                ws.current.onclose = null; // Prevent reconnect on unmount
                ws.current.close();
            }
        };
    }, [connect, isLocalDev]);

    const sendEvent = useCallback((event: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(event));
        }
    }, []);

    const sendConfig = useCallback((config: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'config',
                payload: config
            }));
        }
    }, []);

    return { isConnected, lastAnalysis, sendEvent, sendConfig };
}
