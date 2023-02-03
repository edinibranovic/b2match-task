import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    addDays,
    subMonths,
    addMonths,
    parse,
    getYear
} from 'date-fns';
import '../src/App.scss';

interface CalendarProps {
    date: Date;
}

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
const Calendar: React.FC<CalendarProps> = ({ date }) => {
    const [currentDate, setCurrentDate] = useState(date);
    const [showMonthList, setShowMonthList] = useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const month = format(currentDate, 'MMMM yyyy');

    const weekdays = Array.from({ length: 7 }, (_, i) =>
        format(addDays(startOfWeek(monthStart), i), 'iii')
    );
    const days = Array.from({ length: monthEnd.getDate() }, (_, i) =>
        addDays(monthStart, i)
    );

    const previousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const toggleMonthList = () => {
        setShowMonthList(!showMonthList);
    };
    const nextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const monthClick = (month: number) => {
        setCurrentDate(parse(`${months[month]} 1 ${getYear(currentDate)}`, 'MMMM d yyyy', new Date()));
        setShowMonthList(false);
    };
    const dayClick = (day: Date) => {
        setCurrentDate(day);
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <div className="month-title">
                    <button onClick={previousMonth}>{"<"}</button>
                    <button onClick={toggleMonthList}>{month}</button>
                    <button onClick={nextMonth}>{">"}</button>
                </div>
            </div>
            <div className="calendar-weekdays">
                {weekdays.map((weekday) => (
                    <div className="weekday" key={weekday}>
                        {weekday}
                    </div>
                ))}
            </div>
            <div className="calendar-days">
                {days.map((day) => (
                    <div className="day" key={day.toString()} onClick={() => dayClick(day)}>
                        {day.getDate()}
                    </div>
                ))}
            </div>
            <div className="selected-date">
                {format(currentDate, 'MMMM dd, yyyy')}
                {showMonthList && (
                    <ul>
                        {months.map((month, index) => (
                            <li key={month} onClick={() => monthClick(index)}>
                                {month}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Calendar;
