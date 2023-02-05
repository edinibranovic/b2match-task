import React, { useMemo, useState } from "react";
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
  getDate,
} from "date-fns";
import "../src/App.scss";

interface CalendarProps {
  date: Date;
}
const Calendar: React.FC<CalendarProps> = ({ date }) => {
  const [currentDate, setCurrentDate] = useState(date);
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
  const [yearFormat, setYearFormat] = useState("MMMM d yyyy");

  const years: Array<string> = Array.from({ length: 3000 }, (_, i) =>
    (i + 1).toString()
  );
  const months: Array<string> = [
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
  const monthStart: Date = startOfMonth(currentDate);
  const monthEnd: Date = endOfMonth(currentDate);
  const month: string = format(currentDate, "MMMM yyyy");

  const weekdays: Array<string> = Array.from({ length: 7 }, (_, i) =>
    format(addDays(startOfWeek(monthStart, { weekStartsOn: 1 }), i), "iii")
  );
  const days: Array<Date> = Array.from({ length: monthEnd.getDate() }, (_, i) =>
    addDays(monthStart, i)
  );

  const allDays: Array<Date> = useMemo(() => {
    let numbers: Array<Date> = [];
    let lastDayOfPreviouMonth: Date = endOfMonth(subMonths(currentDate, 1));
    let firstDayOfNextMonth: Date = startOfMonth(addMonths(currentDate, 1));
    let daysInPreviousMonth: number = startOfMonth(currentDate).getDay() - 1;
    let daysInNextMonth: number = 7 - endOfMonth(currentDate).getDay();

    for (let i = 0; i < daysInPreviousMonth; i++) {
      numbers.push(subDays(lastDayOfPreviouMonth, i));
    }

    numbers.reverse();
    days.forEach((day) => numbers.push(day));

    for (let i = 0; i < daysInNextMonth; i++) {
      numbers.push(addDays(firstDayOfNextMonth, i));
    }

    return numbers;
  }, [days]);

  const datePostfix: string = useMemo(() => {
    let dayOfTheMonth: number = getDate(currentDate);
    if (dayOfTheMonth > 3 && dayOfTheMonth < 21) {
      return "th";
    }
    switch (dayOfTheMonth % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }, [currentDate]);

  const previousMonth = () => {
    setCurrentDate(startOfMonth(subMonths(currentDate, 1)));
  };
  const nextMonth = () => {
    setCurrentDate(startOfMonth(addMonths(currentDate, 1)));
  };
  const toggleMonthList = () => {
    setShowMonthList(!showMonthList);
  };
  const onMonthClick = (month: number) => {
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
  const onYearClick = (year: number) => {
    let digitCount: number = year.toString().length;
    setYearFormat("MMMM d " + "y".repeat(digitCount));
    setCurrentDate(
      parse(
        `${months[getMonth(currentDate)]} 1 ${years[year]}`,
        "MMMM d yyyy",
        new Date()
      )
    );
    setShowYearList(false);
  };

  const onDayClick = (day: Date) => {
    if (getMonth(day) === getMonth(currentDate)) setCurrentDate(day);
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
              onClick={() => onDayClick(day)}
            >
              <div className="calendar-date">{day.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className="selected-date">
        {format(currentDate, yearFormat).split(" ")[0] +
          " " +
          format(currentDate, yearFormat).split(" ")[1] +
          datePostfix +
          " " +
          format(currentDate, yearFormat).split(" ")[2]}
        {showMonthList && (
          <ul>
            {months.map((month, index) => (
              <li key={month} onClick={() => onMonthClick(index)}>
                {month}
              </li>
            ))}
          </ul>
        )}
        {showYearList && (
          <ul>
            {years.map((year, index) => (
              <li key={year} onClick={() => onYearClick(index)}>
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
