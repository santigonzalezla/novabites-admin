'use client';
import styles from './monthfilter.module.css';

interface MonthFilterProps {
    selectedMonth: string;
    onMonthChange: (month: string) => void;
}

const MonthFilter = ({ selectedMonth, onMonthChange }: MonthFilterProps) =>
{
    return (
        <div className={styles.filterContainer}>
            <label htmlFor="monthFilter" className={styles.label}>
                Filtrar por mes:
            </label>
            <input
                id="monthFilter"
                type="month"
                className={styles.input}
                value={selectedMonth}
                max={new Date().toISOString().slice(0, 7)}
                onChange={(e) => e.target.value && onMonthChange(e.target.value)}
            />
        </div>
    );
};

export default MonthFilter;
