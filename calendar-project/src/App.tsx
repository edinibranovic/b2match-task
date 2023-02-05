import React, { useEffect, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  subMonths,
  addMonths,
  parse,
  getYear,
  getMonth,
  subDays,
} from "date-fns";
import "../src/App.scss";

interface CalendarProps {
  date: Date;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = Array.from({ length: 3000 }, (_, i) => (i + 1).toString());
const Calendar: React.FC<CalendarProps> = ({ date }) => {
  const [currentDate, setCurrentDate] = useState(date);
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const month = format(currentDate, "MMMM yyyy");

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(startOfWeek(monthStart, { weekStartsOn: 1 }), i), "iii")
  );
  const days = Array.from({ length: monthEnd.getDate() }, (_, i) =>
    addDays(monthStart, i)
  );

  const allDays = useMemo(() => {
    let numbers = [];
    let lastDay: Date = endOfMonth(subMonths(currentDate, 1));
    let firstDay: Date = startOfMonth(addMonths(currentDate, 1));
    let kajGod = startOfMonth(currentDate).getDay() - 1;
    let kajGod2 = 7 - endOfMonth(currentDate).getDay();
    console.log(lastDay);

    for (let i = 0; i < kajGod; i++) {
      numbers.push(subDays(lastDay, i));
    }
    numbers.reverse();

    days.forEach((day) => numbers.push(day));

    for (let i = 0; i < kajGod2; i++) {
      numbers.push(addDays(firstDay, i));
    }
    return numbers;
  }, [days]);

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  const toggleMonthList = () => {
    setShowMonthList(!showMonthList);
  };
  const monthClick = (month: number) => {
    setCurrentDate(
      parse(
        `${months[month]} 1 ${getYear(currentDate)}`,
        "MMMM d yyyy",
        new Date()
      )
    );
    setShowMonthList(false);
  };
  const toggleYearList = () => {
    setShowYearList(!showYearList);
  };
  const yearClick = (year: number) => {
    /*let digitCount: number = Math.log(year) * Math.LOG10E + 1 | 0;
        console.log(digitCount);
        formattedDate = 'MMMM d ' + "y".repeat(digitCount+1);
        console.log(formattedDate);*/
    setCurrentDate(
      parse(
        `${months[getMonth(currentDate)]} 1 ${years[year]}`,
        "MMMM d yyyy",
        new Date()
      )
    );
    setShowYearList(false);
  };

  const dayClick = (day: Date) => {
    setCurrentDate(day);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="month-title">
          <button onClick={previousMonth}>{"<"}</button>
          <button onClick={toggleMonthList}>{month.split(" ")[0]}</button>
          <button onClick={toggleYearList}>{month.split(" ")[1]}</button>
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
        {allDays.map((day, index) => {
          return (
            <div
              className="day"
              key={day.toString()}
              onClick={() => dayClick(day)}
            >
              <div className="calendar-date">{day.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="selected-date">
        {format(currentDate, "MMMM d yyyy")}
        {showMonthList && (
          <ul>
            {months.map((month, index) => (
              <li key={month} onClick={() => monthClick(index)}>
                {month}
              </li>
            ))}
          </ul>
        )}
        {showYearList && (
          <ul>
            {years.map((year, index) => (
              <li key={year} onClick={() => yearClick(index)}>
                {year}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Calendar;
