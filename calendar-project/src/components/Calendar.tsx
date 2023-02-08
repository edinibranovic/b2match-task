import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useNavigate } from "react-router-dom";

//Initialized object that will be used for copying and manipulating values of certain properties fetched with RapidAPI.
type Event = {
  title: string;
  dateOfEvent: Date;
  timeOfEvent: string;
};

//Access token for RapidAPI - a free public api that I chose for this project. Very unsafe like this, but that's okay for this project.
const token = "a918ea7b11msh149491656dcbb2cp173575jsnc7093e1c73d2";

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
  const [yearFormat, setYearFormat] = useState("MMMM d yyyy");
  const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
  const dateRef = useRef(currentDate);

  //Array with an arbitrary amount of strings representing years of the calendar.
  const years: Array<string> = Array.from({ length: 2030 }, (_, i) =>
    (i + 1).toString()
  ).reverse();

  const monthStart: Date = startOfMonth(currentDate);
  const monthEnd: Date = endOfMonth(currentDate);
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

  //Array with all 7 days of the week as 3-letter acronyms.
  const weekdays: Array<string> = Array.from({ length: 7 }, (_, i) =>
    format(addDays(startOfWeek(monthStart, { weekStartsOn: 1 }), i), "iii")
  );
  //Array with all days in the current month.
  const days: Array<Date> = Array.from({ length: monthEnd.getDate() }, (_, i) =>
    addDays(monthStart, i)
  );

  /*
  Fetching time data with RapidAPI and saving certain attributes in the Event objects,
  so they can later be shown in the calendar.
  NOTICE -----> The calendar I used has a couple of instances where it stores events for the wrong year
  (year 2021 instead of 2022 etc.). So just bear in mind there wasn't anything I could do with that
  except use a different group of events, but I discovered this issue too late to implement such a change before the deadline.
  Next time I will pay more attention to the quality of data I find online :) ...
  */
  useEffect(() => {
    const copyEvents: Event[] = [];
    fetch(
      `https://public-holiday.p.rapidapi.com/${currentDate.getFullYear()}/US`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": token,
          "X-RapidAPI-Host": "public-holiday.p.rapidapi.com",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        for (const obj of response) {
          copyEvents.push({
            title: obj.name,
            dateOfEvent: new Date(obj.date),
            timeOfEvent: obj.date, //This can be a time interval, but since I am working with holidays it will be same as dateOfEvent
          });
        }
      })
      .then(() => {
        setFetchedEvents(copyEvents);
        console.log(fetchedEvents);
      })
      .catch((err) => console.error(err));
  }, [getYear(currentDate)]);

  /*a
  Changes the URL postfix to show the current date in YYYY-DD-MM format.
  ----------------------------------------------------------BUG----------------------------------------------------------
    The URL value doesn't change on page refresh. I wasn't able to find the solution in time,
    but I left the code to show my progress and because, as far as I'm aware, it doesn't affect other functionalities...
  ----------------------------------------------------------BUG----------------------------------------------------------
  */
  const changeURL = (currDate: Date) => {
    let dateString = currDate
      .toLocaleDateString("en-US", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
      .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");

    if (dateRef.current !== currentDate) {
      navigate("/date/" + dateString);
    }

    dateRef.current = currentDate;
  };

  /*
  Every time 'days' changes, the order of dates shown in the calendar is recalculated.
  This way we make sure we see all the days in a month, as well as its surrounding days if they're needed
  to fill the calendar page from Monday to Sunday.
  */
  const allDays: Array<Array<Date>> = useMemo(() => {
    const chunks = [];
    const chunkSize: number = 7;
    let numbers: Array<Date> = [];
    let lastDayOfPreviousMonth: Date = endOfMonth(subMonths(currentDate, 1));
    let firstDayOfNextMonth: Date = startOfMonth(addMonths(currentDate, 1));
    let daysInPreviousMonth: number = startOfMonth(currentDate).getDay() - 1;
    let daysInNextMonth: number = 7 - endOfMonth(currentDate).getDay();
    let loopCount: number =
      daysInPreviousMonth > 4 && daysInNextMonth < 7 ? 42 : 35;

    for (let i = 0; i < daysInPreviousMonth; i++) {
      numbers.push(subDays(lastDayOfPreviousMonth, i));
    }

    numbers.reverse();
    days.forEach((day) => numbers.push(day));

    for (let i = 0; i < chunkSize; i++) {
      numbers.push(addDays(firstDayOfNextMonth, i));
    }

    for (let i = 0; i < loopCount; i += chunkSize) {
      chunks.push(numbers.slice(i, i + chunkSize));
    }

    return chunks;
  }, [days]);

  /*
  Every time currentDate changes, a postfix for the NEW date value is calculated.
  */
  const datePostfix = useMemo(() => {
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

  /*
  Show the previous month when the '<' button is clicked.
  */
  const previousMonth = () => {
    let parsedCurrentDate: Date = startOfMonth(subMonths(currentDate, 1));
    setCurrentDate(parsedCurrentDate);
    changeURL(parsedCurrentDate);
    if (showYearList) toggleYearList();
    if (showMonthList) toggleMonthList();
  };

  /*
  Show the next month when the '>' button is clicked.
  */
  const nextMonth = () => {
    let parsedCurrentDate: Date = startOfMonth(addMonths(currentDate, 1));
    setCurrentDate(parsedCurrentDate);
    changeURL(parsedCurrentDate);
    if (showYearList) toggleYearList();
    if (showMonthList) toggleMonthList();
  };

  const toggleMonthList = () => {
    if (showYearList) toggleYearList();
    setShowMonthList(!showMonthList);
  };

  /*
  When a month from the list of months is clicked, currentDate updates its value and the list closes.
  */
  const onMonthClick = (month: number) => {
    let parsedCurrentDate = parse(
      `${months[month]} 1 ${getYear(currentDate)}`,
      "MMMM d yyyy",
      new Date()
    );
    setCurrentDate(parsedCurrentDate);
    changeURL(parsedCurrentDate);
    setShowMonthList(false);
  };

  const toggleYearList = () => {
    if (showMonthList) toggleMonthList();
    setShowYearList(!showYearList);
  };

  /*
  When a year from the list of years is clicked, currentDate updates its value and the list closes.
  YearFormat changes based on the digit count of the NEW year value.
  */
  const onYearClick = (year: number) => {
    let digitCount: number = years[year].toString().length;
    setYearFormat("MMMM d " + "y".repeat(digitCount));
    let parsedCurrentDate = parse(
      `${months[getMonth(currentDate)]} 1 ${years[year]}`,
      "MMMM d yyyy",
      new Date()
    );
    setCurrentDate(parsedCurrentDate);
    changeURL(parsedCurrentDate);
    setShowYearList(false);
  };

  /*
  When a specific day/date is clicked, currentDate updates its value.
  */
  const onDayClick = (day: Date) => {
    if (getMonth(day) === getMonth(currentDate)) {
      setCurrentDate(day);
      changeURL(day);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen from-green-50 via-green-100 to-green-500 bg-gradient-to-br">
      <div className="h-full w-3/4 p-6 bg-white rounded-2xl shadow-xl flex flex-col mb-4">
        <div className="flex justify-center pb-4">
          <button
            className="text-green-600 bg-white bg-white hover:text-teal-500 focus:outline-none"
            onClick={previousMonth}
          >
            {"<"}
          </button>
          <button
            className="text-green-600 bg-white hover:text-teal-500 focus:outline-none"
            onClick={toggleMonthList}
          >
            {format(currentDate, yearFormat).split(" ")[0] +
              " " +
              format(currentDate, yearFormat).split(" ")[1] +
              datePostfix}
          </button>
          <button
            className="text-green-600 bg-white hover:text-teal-500 focus:outline-none"
            onClick={toggleYearList}
          >
            {format(currentDate, yearFormat).split(" ")[2]}
          </button>
          <button
            className="text-green-600 bg-white hover:text-teal-500 focus:outline-none"
            onClick={nextMonth}
          >
            {">"}
          </button>
        </div>
        {!showMonthList && !showYearList && (
          <div>
            <div className="flex justify-between font-medium uppercase text-xs pt-4 pb-2 border-t">
              {weekdays.map((weekday) => (
                <div
                  className="w-[30px] md:w-full px-3 border rounded-sm w-full h-5 flex items-center justify-center border-green-500 text-green-600 shadow-md"
                  key={weekday}
                >
                  {weekday}
                </div>
              ))}
            </div>
            <div className="flex flex-col w-full h-fit">
              {allDays.map((dayGroup: Array<Date>, index) => {
                return (
                  <div className="flex h-24 w-full justify-between font-medium text-sm pb-2">
                    {dayGroup.map((day, index) => {
                      return (
                        <div
                          className="w-[30px] md:w-[56px] flex grow  flex-row-reverse border hover:border-green-500 text-green-500 cursor-pointer"
                          key={day.toString()}
                          onClick={() => onDayClick(day)}
                        >
                          <div className="sticky top-0 right-0 text-green-600 pr-1">
                            {day.getDate()}
                          </div>
                          <div className="scrollbar overflow-y-hidden hover:overflow-y-scroll h-full w-full mx-1">
                            {fetchedEvents.map((e) => {
                              if (
                                getMonth(e.dateOfEvent) === getMonth(day) &&
                                getDate(e.dateOfEvent) === getDate(day)
                              ) {
                                return (
                                  <div className="rounded my-4 ">
                                    <p className="flex flex-wrap rounded bg-violet-200 w-fit max-w-full text-xs text-green-700 p-1 hover:text-teal-600 hover:bg-violet-300">
                                      {e.title}
                                      <br />
                                      {e.timeOfEvent}
                                    </p>
                                  </div>
                                );
                              }
                            })}
                            {/*There aren't a lot of events to show in the calendar,
                            so you can add these example events if you want to see how the calendar would display them*/
                            /*<div className="rounded my-4 ">
                                <p className="flex flex-wrap rounded bg-violet-200 w-fit max-w-full text-xs text-green-500 p-1 hover:text-teal-600 hover:bg-violet-300">
                                  Example event
                                  <br />
                                  Example date
                                </p>
                              </div>*/}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {showMonthList && (
          <div>
            <ul className="flex flex-col justify-center text-center text-green-600 pl-10">
              {months.map((month, index) => (
                <li
                  className="py-2 md:py-3 hover:text-teal-500 cursor-pointer"
                  key={month}
                  onClick={() => onMonthClick(index)}
                >
                  {month}
                </li>
              ))}
            </ul>
          </div>
        )}
        {showYearList && (
          <div className="flex flex-col text-lg text-center text-green-600 year-scrollbar overflow-y-scroll h-full pl-8">
            <ul>
              {years.map((year, index) => (
                <li
                  className="hover:text-teal-500 cursor-pointer"
                  key={year}
                  onClick={() => onYearClick(index)}
                >
                  {year}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
