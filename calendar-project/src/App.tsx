import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, subMonths, addMonths } from 'date-fns';
import '../src/App.scss';
interface CalendarProps {
    date: Date;
}

const Calendar: React.FC<CalendarProps> = ({ date }) => {
    const [currentDate, setCurrentDate] = useState(date);

    const startOfMonthDate = startOfMonth(currentDate);
    const endOfMonthDate = endOfMonth(currentDate);

    const month = format(currentDate, 'MMMM yyyy');
    const weekdays = Array.from({ length: 7 });
    const days = Array.from({ length: endOfMonthDate.getDate() });

    const handlePreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <div className="month-name">
                    <button onClick={handlePreviousMonth}>{"<"}</button>
                    {month}
                    <button onClick={handleNextMonth}>{">"}</button>
                </div>
            </div>
            <div className="calendar-weekdays">
                {weekdays.map((weekday) => (
                    <div className="weekday">
                    </div>
                ))}
            </div>
            <div className="calendar-days">
                {days.map((day) => (
                    <div className="day">
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
