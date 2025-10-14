'use client';

import styles from "./logcontainer.module.css";
import { Log } from '@/interfaces/interfaces';
import { useState } from 'react';
import { ArrowDown } from '@/app/components/svg';

interface LogContainerProps {
    logs: Log[]
}

const CHAR_LIMIT = 150;

const LogContainer = ({ logs }: LogContainerProps) =>
{
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

    const toggleExpand = (logId: string) =>
    {
        setExpandedLogs((prev) =>
        {
            const newSet = new Set(prev);
            (newSet.has(logId)) ? newSet.delete(logId) : newSet.add(logId);

            return newSet;
        });
    };

    const buildLogText = (log: Log) =>
    {
        const parts = [log.message];
        if (log.description) parts.push(`- ${log.description}`);
        if (log.userId) parts.push(`User: ${log.userId}`);
        if (log.statusCode) parts.push(`Status: ${log.statusCode}`);
        if (log.responseTimeMs) parts.push(`${log.responseTimeMs}ms`);
        if (log.orderId) parts.push(`Order: ${log.orderId}`);
        if (log.productId) parts.push(`Product: ${log.productId}`);
        return parts.join(" ");
    };

    const formatTimestamp = (timestamp: Date | string) =>
    {
        const date = new Date(timestamp);
        return date.toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getActionClass = (action: string) =>
    {
        const actionMap: Record<string, string> = {
            'CREATE': styles.actionCreate,
            'READ': styles.actionRead,
            'UPDATE': styles.actionUpdate,
            'DELETE': styles.actionDelete,
            'LOGIN': styles.actionLogin,
            'LOGOUT': styles.actionLogout,
            'EXPORT': styles.actionExport,
            'IMPORT': styles.actionImport,
            'BACKUP': styles.actionBackup,
            'RESTORE': styles.actionRestore
        };

        return actionMap[action] || '';
    };

    return (
        <div className={styles.container}>
            <div className={styles.logsWrapper}>
                {logs.length === 0 ? (
                    <p className={styles.emptyMessage}>No hay logs disponibles</p>
                ) : (
                    logs.map((log) => {
                        const fullText = buildLogText(log);
                        const isExpanded = expandedLogs.has(log.id);
                        const needsTruncation = fullText.length > CHAR_LIMIT;
                        const displayText = isExpanded || !needsTruncation
                            ? fullText
                            : `${fullText.slice(0, CHAR_LIMIT)}...`;

                        return (
                            <div
                                key={log.id}
                                className={`${styles.logEntry} ${isExpanded ? styles.expanded : ''}`}
                            >
                                <span className={styles.timestamp}>{formatTimestamp(log.createdAt)}</span>
                                <span className={`${styles.level} ${styles[log.level.toLowerCase()]}`}>[{log.level}]</span>
                                <span className={styles.context}>[{log.context}]</span>
                                <span className={`${styles.action} ${getActionClass(log.action)}`}>{log.action}</span>
                                <span className={styles.logText}>{displayText}</span>
                                {needsTruncation && (
                                    <button
                                        onClick={() => toggleExpand(log.id)}
                                        className={styles.expandButton}
                                        aria-label={isExpanded ? "Colapsar log" : "Expandir log"}
                                    >
                                        <ArrowDown className={`${styles.arrow} ${isExpanded ? styles.arrowUp : ""}`} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LogContainer;