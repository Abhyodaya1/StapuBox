import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CalendarProps {
  currentMonth: number;
  year: number;
  selectedDate: number | null;
  highlightDays: Set<number>;
  onDateSelect: (date: number | null) => void;
  onMonthChange: (delta: number) => void;
  monthNames: string[];
}

const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  year,
  selectedDate,
  highlightDays,
  onDateSelect,
  onMonthChange,
  monthNames,
}) => {
  const firstDay = new Date(year, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(year, currentMonth, 0).getDate();
  const prevDaysInMonth = new Date(year, currentMonth - 1, 0).getDate();
  const weekStart = 1; // Monday
  const offset = (firstDay - weekStart + 7) % 7;
  const calendarDays = [];

  for (let i = 0; i < offset; i++) {
    const day = prevDaysInMonth - offset + 1 + i;
    calendarDays.push({ day, current: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, current: true });
  }

  let nextDay = 1;
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ day: nextDay++, current: false });
  }

  return (
    <View style={styles.calendarContainer}>
      {/* Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => onMonthChange(-1)}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth - 1]} {year}
        </Text>
        <TouchableOpacity onPress={() => onMonthChange(1)}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday row */}
      <View style={styles.weekDays}>
        {['m', 't', 'w', 't', 'f', 's', 's'].map((d, i) => (
          <Text key={i} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.daysGrid}>
        {calendarDays.map((d, i) => {
          const isHighlighted = highlightDays.has(d.day) && d.current;
          const isSelected = selectedDate === d.day && isHighlighted;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (isHighlighted) {
                  onDateSelect(d.day);
                } else {
                  onDateSelect(null);
                }
              }}
              style={styles.dayContainer}
            >
              <View
                style={[
                  styles.dayWrapper,
                  isSelected && styles.selectedDay, // Encircle if clicked
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !d.current && styles.grayDay,
                    isHighlighted && styles.boldDay, // Bold highlighted days
                    isSelected && styles.selectedText, // White text when selected
                  ]}
                >
                  {String(d.day).padStart(2, '0')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrow: {
    color: '#ff7f00',
    fontSize: 24,
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#828282',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  weekDay: {
    color: 'gray',
    fontSize: 12,
    width: '14%',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayWrapper: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#ff7f00',
    borderRadius: 15,
  },
  selectedText: {
    color: '#fff',
  },
  dayText: {
    fontSize: 14,
  },
  grayDay: {
    color: 'gray',
  },
  boldDay: {
    fontWeight: 'bold',
    color: '#000', // darker for emphasis
  },
});

export default Calendar;
