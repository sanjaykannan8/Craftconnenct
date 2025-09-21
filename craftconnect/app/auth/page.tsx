"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./auth.module.css";

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const returnTo = searchParams?.get("returnTo") || "/Qr";

    useEffect(() => {
        // Check if already authenticated
        const checkAuth = async () => {
            const response = await fetch('/api/check-auth');
            if (response.ok) {
                router.push(returnTo);
            }
        };
        checkAuth();
    }, [router, returnTo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Authentication successful, redirect to original page
                router.push(returnTo);
            } else {
                setError(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setError("An error occurred during authentication");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>🔐 Access Required</h1>
                    <p className={styles.subtitle}>Enter the magic word to continue</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter the magic word..."
                            className={styles.input}
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>
                            ❌ {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Verifying...
                            </>
                        ) : (
                            "✨ Enter"
                        )}
                    </button>
                </form>

                <div className={styles.hint}>
                    <p>💡 Hint: It's a magical word that opens doors!</p>
                </div>
            </div>
        </div>
    );
}
