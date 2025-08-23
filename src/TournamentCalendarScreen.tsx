import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Calendar from './components/Calendar'; 
import TournamentCard from './components/TournamentCard';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

interface Match {
  id: number;
  stage: string;
  team_a: string;
  team_b: string;
  start_time: string;
  venue: string;
  status?: string;
}

interface Tournament {
  id: number;
  name: string;
  tournament_img_url: string;
  level: string;
  start_date: string;
  end_date?: string;
  matches: Match[];
  sport_id?: number;
  sport_name?: string;
}

interface Sport {
  sports_id: number;
  sport_name: string;
  tournaments: Tournament[];
}

interface ApiResponse {
  status: string;
  msg: string;
  err: string | null;
  data: Sport[];
}

const TournamentCalendarScreen: React.FC = () => {
  
  const { width } = Dimensions.get('window');
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // August
  const year = 2025;
  const [expandedTournaments, setExpandedTournaments] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedTournaments, setCachedTournaments] = useState<Tournament[] | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedTournaments, setLikedTournaments] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCachedData();
    loadLikedTournaments();
    fetchSports();
    fetchTournaments();
  }, []);

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem('tournaments');
      if (cached) {
        const parsed = JSON.parse(cached) as Tournament[];
        setCachedTournaments(parsed);
        setAllTournaments(parsed);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error loading cache:', err);
    }
  };

  const cacheData = async (data: Tournament[]) => {
    try {
      await AsyncStorage.setItem('tournaments', JSON.stringify(data));
    } catch (err) {
      console.error('Error caching data:', err);
    }
  };

  const loadLikedTournaments = async () => {
    try {
      const liked = await AsyncStorage.getItem('likedTournaments');
      if (liked) {
        setLikedTournaments(new Set(JSON.parse(liked)));
      }
    } catch (err) {
      console.error('Error loading liked tournaments:', err);
    }
  };

  const saveLikedTournaments = async (likedIds: Set<number>) => {
    try {
      await AsyncStorage.setItem('likedTournaments', JSON.stringify(Array.from(likedIds)));
    } catch (err) {
      console.error('Error saving liked tournaments:', err);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await fetch('https://stapubox.com/sportslist');
      const json = await response.json();
      console.log('Sports API Response:', json);
      if (json.status === 'success') {
        setSports([{ sports_id: 'ALL', sport_name: 'All', tournaments: [] }, ...json.data]);
      } else {
        throw new Error('Failed to fetch sports');
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
      setError('Failed to load sports list. Using default if available.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load sports list.',
      });
    }
  };

  const fetchTournaments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://stapubox.com/tournament/demo');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json() as ApiResponse;
      console.log('Tournaments API Response:', json);
      if (json.status === 'success') {
        const tournaments = json.data.flatMap(sport =>
          sport.tournaments.map(t => ({ ...t, sport_id: sport.sports_id, sport_name: sport.sport_name }))
        );
        const sorted = tournaments.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        setAllTournaments(sorted);
        cacheData(sorted);
      } else {
        throw new Error('Data fetch unsuccessful');
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setError('Failed to load tournaments. Showing cached data if available.');
      if (cachedTournaments) {
        setAllTournaments(cachedTournaments);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load tournaments.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredTournaments = () => {
    let filtered = allTournaments.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedSport !== 'ALL') {
      filtered = filtered.filter(t => t.sport_id === Number(selectedSport));
    }
    filtered = filtered.filter(t => {
      const date = new Date(t.start_date);
      const m = date.getMonth() + 1;
      return m >= 8 && m <= 10 && date.getFullYear() === 2025;
    });
    if (selectedDate) {
      filtered = filtered.filter(t => {
        const date = new Date(t.start_date);
        return date.getMonth() + 1 === currentMonth && date.getDate() === selectedDate;
      });
    }
    return filtered;
  };

  const getHighlightDays = () => {
    const filtered = getFilteredTournaments();
    const days = new Set(
      filtered
        .filter(t => new Date(t.start_date).getMonth() + 1 === currentMonth)
        .map(t => new Date(t.start_date).getDate())
    );
    return days;
  };

  const toggleExpand = (id: number) => {
    setExpandedTournaments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLike = (id: number) => {
    const newLikedTournaments = new Set(likedTournaments);
    if (newLikedTournaments.has(id)) {
      newLikedTournaments.delete(id);
      Toast.show({
        type: 'success',
        text1: 'Unliked',
        text2: 'Tournament removed from likes.',
      });
    } else {
      newLikedTournaments.add(id);
      Toast.show({
        type: 'success',
        text1: 'Liked',
        text2: 'Tournament added to likes.',
      });
    }
    setLikedTournaments(newLikedTournaments);
    saveLikedTournaments(newLikedTournaments);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  };

  const getDateRange = (t: Tournament): string => {
    let start = new Date(t.start_date);
    let end = t.end_date ? new Date(t.end_date) : start;
  
    if (isNaN(start.getTime())) {
      console.warn(`Invalid start_date for tournament ${t.name}: ${t.start_date}`);
      start = new Date(); // Fallback to current date
    }
    if (isNaN(end.getTime())) {
      console.warn(`Invalid end_date for tournament ${t.name}: ${t.end_date}`);
      end = start; // Fallback to start date
    }
  
    if (t.matches && Array.isArray(t.matches) && t.matches.length > 0) {
      const matchDates = t.matches
        .map(m => {
          const matchDate = m.start_time ? new Date(m.start_time) : new Date(t.start_date); // Fallback to tournament start_date
          if (isNaN(matchDate.getTime())) {
            console.warn(`Invalid start_time for match ${m.id} in tournament ${t.name}: ${m.start_time}`);
            return new Date(t.start_date); // Fallback to tournament start_date
          }
          return matchDate;
        })
        .filter(date => !isNaN(date.getTime())); // Filter out any remaining invalid dates
      if (matchDates.length > 0) {
        start = new Date(Math.min(start.getTime(), ...matchDates.map(d => d.getTime())));
        end = new Date(Math.max(end.getTime(), ...matchDates.map(d => d.getTime())));
      }
    }
  
    return `${formatDate(start.toISOString())} - ${formatDate(end.toISOString())}`;
  };
  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    if (newMonth < 8) newMonth = 8;
    if (newMonth > 10) newMonth = 10;
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setVisibleCount(10);
  };

  const monthNames = ['Jan', 'Feby', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const loadMore = () => {
    if (isLoadingMore || visibleCount >= filteredTournaments.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, filteredTournaments.length));
      setIsLoadingMore(false);
    }, 1000);
  };

  const filteredTournaments = getFilteredTournaments();

  const SkeletonTournament = () => (
    <View style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        <View style={[styles.tournamentLogo, styles.skeleton]} />
        <View style={styles.tournamentInfo}>
          <View style={[styles.skeletonText, { width: '80%' }]} />
          <View style={[styles.skeletonText, { width: '60%' }]} />
          <View style={[styles.skeletonText, { width: '50%' }]} />
          <View style={[styles.skeletonText, { width: '40%' }]} />
        </View>
        <View style={styles.actionButtonsSkeleton} />
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonTournament key={index} />
      ))}
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchTournaments} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.searchBarSkeleton} />
        <View style={styles.sportPickerSkeleton} />
        <View style={styles.calendarSkeleton}>
          <View style={styles.calendarHeaderSkeleton} />
          <View style={styles.weekDaysSkeleton} />
          <View style={styles.daysGridSkeleton} />
        </View>
        {renderSkeleton()}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search tournaments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        <Pressable style={styles.sportSelector} onPress={() => setIsDropdownVisible(true)}>
          <Text style={styles.selectedSportText}>
            {sports.find(s => s.sports_id === Number(selectedSport))?.sport_name || 'Select Sport'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </Pressable>
        <Modal
          transparent={true}
          visible={isDropdownVisible}
          animationType="fade"
          onRequestClose={() => setIsDropdownVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setIsDropdownVisible(false)}>
            <View style={styles.dropdownContainer}>
              <FlatList
                data={sports}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedSport(item.sports_id.toString());
                      setSelectedDate(null);
                      setIsDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.sport_name}</Text>
                  </Pressable>
                )}
                keyExtractor={item => item.sports_id.toString()}
              />
            </View>
          </Pressable>
        </Modal>
        <Calendar
          currentMonth={currentMonth}
          year={year}
          selectedDate={selectedDate}
          highlightDays={getHighlightDays()}
          onDateSelect={setSelectedDate}
          onMonthChange={changeMonth}
          monthNames={monthNames}
        />
        {filteredTournaments.length === 0 ? (
          <Text style={styles.noData}>No data</Text>
        ) : (
          <FlatList
            data={filteredTournaments.slice(0, visibleCount)}
            renderItem={({ item }) => (
              <TournamentCard
                tournament={item}
                isExpanded={!!expandedTournaments[item.id]}
                isLiked={likedTournaments.has(item.id)}
                onExpand={() => toggleExpand(item.id)}
                onLike={() => toggleLike(item.id)}
                formatDate={formatDate}
                formatTime={formatTime}
                getDateRange={getDateRange}
              />
            )}
            keyExtractor={item => item.id.toString()}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#ff7f00" /> : null}
          />
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1 ,
    backgroundColor:'#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('2%')
  },
  searchBar: {
    height: 50,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    margin: 10,
    borderRadius: 5,
  },
  searchBarSkeleton: {
    height: 50,
    backgroundColor: '#e0e0e0',
    margin: 10,
    borderRadius: 5,
  },
  sportSelector: {
    height: 50,
    backgroundColor: '#f8f4f0',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
  sportPickerSkeleton: {
    height: 50,
    backgroundColor: '#e0e0e0',
    margin: 10,
  },
  selectedSportText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 18,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  dropdownContainer: {
    width: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 300,
    elevation: 5,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  calendarSkeleton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  calendarHeaderSkeleton: {
    height: 30,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  weekDaysSkeleton: {
    height: 20,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  daysGridSkeleton: {
    height: 150,
    backgroundColor: '#ccc',
  },
  noData: {
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
    color: 'gray',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff7f00',
    padding: 10,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TournamentCalendarScreen;