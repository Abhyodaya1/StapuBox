import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Tournament } from '../TournamentCalendarScreen'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

interface TournamentCardProps {
  tournament: Tournament;
  isExpanded: boolean;
  isLiked: boolean;
  onExpand: () => void;
  onLike: () => void;
  formatDate: (dateStr: string) => string;
  formatTime: (dateStr: string) => string;
  getDateRange: (t: Tournament) => string;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  isExpanded,
  isLiked,
  onExpand,
  onLike,
  formatDate,
  formatTime,
  getDateRange,
}) => {
  const renderMatch = ({ item }: { item: any }) => (
    <View style={styles.matchCard}>
      <Text style={styles.matchTeams}>{item.team_a} vs {item.team_b}</Text>
      <Text style={styles.matchStage}>{item.stage || 'N/A'}</Text>
      <Text style={styles.matchDate}>{formatDate(item.start_time || tournament.start_date)}</Text>
      <Text style={styles.matchTime}>{formatTime(item.start_time || tournament.start_date)}</Text>
      <Text style={styles.matchVenue}>{item.venue || 'N/A'}</Text>
    </View>
  );

  // Log matches for debugging
  React.useEffect(() => {
    console.log('Matches for tournament', tournament.name, ':', tournament.matches);
  }, [tournament.matches]);

  return (
    <View style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        <Image source={{ uri: tournament.tournament_img_url }} style={styles.tournamentLogo} />
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentName}>{tournament.name}</Text>
          <Text style={styles.tournamentSport}>{tournament.sport_name || 'Unknown'}</Text>
          <Text style={styles.tournamentDate}>{getDateRange(tournament)}</Text>
          <Text style={styles.tournamentLevel}>{tournament.level}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={onLike}>
            <Text style={[styles.likeIcon, isLiked && styles.likedIcon]}>{isLiked ? '♥' : '♡'}</Text>
          </TouchableOpacity>
          {tournament.matches && tournament.matches.length > 0 && (
            <TouchableOpacity onPress={onExpand}>
              <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isExpanded && tournament.matches && tournament.matches.length > 0 && (
        <View>
          {tournament.matches.map(match => (
            <View key={match.id}>{renderMatch({ item: match })}</View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tournamentCard: {
    margin: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tournamentHeader: 
  { 
    flexDirection: 'row',
     alignItems: 'center' 
 },
  actionButtons: 
  { 
    flexDirection: 'row',
     alignItems: 'center' 
},
  tournamentLogo: 
  {
    width: 50, 
    height: 50, 
    marginRight: 10 
},
  tournamentInfo: 
  { 
    flex: 1
 },
  tournamentName: 
  { 
    fontSize: 16, 
    fontWeight: 'bold' 
},
  tournamentSport:
   {
     fontSize: 14,
     color: 'gray' 
    },
  tournamentDate: 
  { 
    fontSize: 12,
     color: 'gray'
     },
  tournamentLevel: 
  { 
    fontSize: 12,
     color: '#007bff'
     },
  expandIcon: 
  { fontSize: 20, 
    color: 'gray',
     marginLeft: 10 
    },
  likeIcon: 
  { 
    fontSize: 20,
     color: 'gray'
     },
  likedIcon: 
  { color: 'red' },
  matchCard: 
  { 
    marginTop: 10, 
    
    padding: 10, backgroundColor: '#ff7f00', borderRadius: 10, color: '#fff' },
  matchTeams: 
  { 
    fontSize: 14, fontWeight: 'bold', color: '#fff' },
  matchStage: 
  { 
    fontSize: 12, color: '#fff' },
  matchDate: 
  { 
    fontSize: 12, color: '#fff' },
  matchTime: 
  { 
    fontSize: 12,
     color: '#fff'
     },
  matchVenue: 
  { 
    fontSize: 12,
     color: '#fff'
     },
});

export default TournamentCard;