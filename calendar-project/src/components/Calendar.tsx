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
  description: string;
};

//Access token for RapidAPI - a free public api that I chose for this project.
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
  Fetching time data with RapidAPI and saving certain attributes in the Event objects, so they can later be shown in the calendar.
  */
  useEffect(() => {
    const copyEvents: Event[] = [];
    fetch(
      `https://public-holiday.p.rapidapi.com/${currentDate.getFullYear()}/US`, //${currentDate.getFullYear()}
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
        console.log(response);
      })
      /*response.forEach((obj: Object) => {
            copyEvents.push({title: obj.localName; description: obj.date;});
          })*/
      .catch((err) => console.error(err));
    /*.then(() => {
        setFetchedEvents(copyEvents);
      });*/
  }, []);

  /*
  Changes the URL postfix to show the current date in YYYY-DD-MM format.
  ------------------------------------------------BUG------------------------------------------------
    The URL value is always one step behind, I wasn't able to find the solution in time,
    but I left the code to show my progress and because it doesn't affect other functionalities...
  ------------------------------------------------BUG------------------------------------------------
  */
  const changeURL = () => {
    let dateString = currentDate
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
  to fill the calendar page (5 rows with 7 columns going from Monday to Sunday)
  */
  const allDays: Array<Array<Date>> = useMemo(() => {
    const chunkSize = 7;

    const chunks = [];
    let numbers: Array<Date> = [];
    let lastDayOfPreviousMonth: Date = endOfMonth(subMonths(currentDate, 1));
    let firstDayOfNextMonth: Date = startOfMonth(addMonths(currentDate, 1));
    let daysInPreviousMonth: number = startOfMonth(currentDate).getDay() - 1;
    let daysInNextMonth: number = 7 - endOfMonth(currentDate).getDay();

    for (let i = 0; i < daysInPreviousMonth; i++) {
      numbers.push(subDays(lastDayOfPreviousMonth, i));
    }

    numbers.reverse();
    days.forEach((day) => numbers.push(day));

    for (let i = 0; i < daysInNextMonth; i++) {
      numbers.push(addDays(firstDayOfNextMonth, i));
    }

    for (let i = 0; i < 35; i += chunkSize) {
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
    setCurrentDate(startOfMonth(subMonths(currentDate, 1)));
    changeURL();
    if (showYearList) toggleYearList();
    if (showMonthList) toggleMonthList();
  };

  /*
  Show the next month when the '>' button is clicked.
  */
  const nextMonth = () => {
    setCurrentDate(startOfMonth(addMonths(currentDate, 1)));
    changeURL();
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
    setCurrentDate(
      parse(
        `${months[month]} 1 ${getYear(currentDate)}`,
        "MMMM d yyyy",
        new Date()
      )
    );
    changeURL();
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
    let digitCount: number = year.toString().length;
    setYearFormat("MMMM d " + "y".repeat(digitCount));
    setCurrentDate(
      parse(
        `${months[getMonth(currentDate)]} 1 ${years[year]}`,
        "MMMM d yyyy",
        new Date()
      )
    );
    changeURL();
    setShowYearList(false);
  };

  /*
  When a specific day/date is clicked, currentDate updates its value.
  */
  const onDayClick = (day: Date) => {
    if (getMonth(day) === getMonth(currentDate)) {
      setCurrentDate(day);
      changeURL();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen from-green-50 via-green-100 to-green-500 bg-gradient-to-br">
      <div className="h-full w-3/4 p-6 bg-white rounded-2xl shadow-xl flex flex-col">
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
                          className="px-1 w-[30px] md:w-[56px] flex grow  flex-row-reverse border hover:border-green-500 text-green-500 cursor-pointer"
                          key={day.toString()}
                          onClick={() => onDayClick(day)}
                        >
                          <div className="sticky top-0 right-0 ml-1 text-green-600">
                            {day.getDate()}
                          </div>
                          <div className="scrollbar overflow-y-hidden hover:overflow-y-scroll h-full">
                            <div className="rounded mb-4 ">
                              <p className="text-xs truncate">
                                event 2 blabla
                                <br />
                                12:00 - 15:00
                              </p>
                            </div>
                            <div className="rounded mb-4 ">
                              <p className="text-xs truncate">
                                event 2 blabla
                                <br />
                                12:00 - 15:00
                              </p>
                            </div>
                            <div>
                              <p className="text-xs truncate">
                                event 2 blabla
                                <br />
                                15:00 - 16:00
                              </p>
                            </div>
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
          <div className="flex flex-col text-lg text-center text-green-600 scrollbar overflow-y-scroll h-full pl-8">
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
