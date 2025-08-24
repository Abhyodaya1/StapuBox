import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


import { Tournament } from './TournamentCalendarScreen';
import { widthPercentageToDP } from 'react-native-responsive-screen';


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
  const [svgFailed, setSvgFailed] = useState(true);

  const sport = tournament.sport_name?.toLowerCase();

  const fallbackImage =
    sport === 'badminton'
      ? require('../assets/badminton.png')
      : sport === 'cricket'
      ? require('../assets/cricket.png')
      : sport === 'tennis'
      ? require('../assets/tennis.png')
      : sport === 'football'
      ? require('../assets/football.png')
      : { uri: tournament.tournament_img_url };

      const renderMatch = ({ item }: { item: any }) => (
        <View style={styles.matchMainCard}>
        {/* Match Header */}
        <View style={styles.matchHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {/* Tournament Logo */}
            <Image
              source={fallbackImage}
              style={styles.teamLogo1}
              resizeMode="contain"
            />
    
            {/* Team Names */}
            <Text style={styles.teamName}>{item.team_a || 'Team A'}</Text>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.teamName}>{item.team_b || 'Team B'}</Text>
          </View>
    
          {/* Stage Badge */}
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>{item.stage || 'Quarter Final'}</Text>
          </View>
        </View>
    
        {/* Team Logos */}
        <View style={styles.teamLogosRow}>
          <Image
            source={require('../assets/default_team.png')} // Placeholder for team logos
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.vsText1}>VS</Text>
          <Image
            source={require('../assets/default_team.png')} // Placeholder for team logos
            style={styles.teamLogo}
            resizeMode="contain"
          />
        </View>
    
        {/* Match Details */}
        <View style={styles.matchDetailsCard}>
          <View style={styles.matchDetailsRow}>
            <View style={{flexDirection:'row'}}>
            <FontAwesome name="calendar" size={18} color="#000" style={styles.detailIcon} />
            <Text style={styles.detailText1}>
              {item.start_date
                ? new Date(item.start_date).toISOString().slice(0, 10)
                : 'N/A'}
            </Text>
            </View>
            <View style={{flexDirection:'row' , marginRight:widthPercentageToDP('1%')}}>
            <FontAwesome name="clock-o" size={18} color="#000" style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {item.start_date
                ? new Date(item.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'N/A'}
            </Text>
            </View>
          </View>
    
          <View style={styles.matchDetailsRow}>
            <View style={{flexDirection:'row' , marginLeft:2}}>
            <FontAwesome name="map-marker" size={18} color="#000" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.venue || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>
      );

  return (
    <View style={styles.tournamentCard}>
      <View style={styles.tournamentHeader}>
        {tournament.tournament_img_url ? (
          svgFailed ? (
            <SvgUri
              width={33}
              height={33}
              style={styles.tournamentLogo1}
              uri={tournament.tournament_img_url}
              onError={(e) => {
                setSvgFailed(false); // Switch to fallback
              }}
            />
          ) : (
            <Image
              source={fallbackImage}
              style={styles.tournamentLogo}
              resizeMode="contain"
              onError={(imgError) => {
                console.warn('Image load error fallback:', imgError.nativeEvent.error);
              }}
            />
          )
        ) : (
          <View
            style={[
              styles.tournamentLogo,
              { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
            ]}
          >
            <Text style={{ color: '#aaa', fontSize: 18 }}>No Image</Text>
          </View>
        )}

        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentName}>{tournament.name}</Text>
          <Text style={styles.tournamentSport}>
            {tournament.sport_name === 'football'
              ? 'Football'
              : tournament.sport_name === 'tennis'
              ? 'Tennis'
              : tournament.sport_name === 'cricket'
              ? 'Cricket'
              : tournament.sport_name=== 'badminton'
              ? 'Badminton' 
              : tournament.sport_name || 'Unknown'}
          </Text>
          <Text style={styles.tournamentDate}>{getDateRange(tournament)}</Text>
          
        </View>

        <View style={[
          styles.actionButtons,
          {
            flexDirection: 'column',
            alignItems: 'flex-end', 
            justifyContent: 'flex-end',
           
          }
        ]}>
          <TouchableOpacity onPress={onLike}>
            {/* Use vector icon heart: red when liked, else grey border */}
            <FontAwesome
                name={isLiked ? 'heart' : 'heart-o'} // filled vs outlined heart
                size={20}
                color={isLiked ? 'red' : 'gray'}
            />
          </TouchableOpacity>
          <Text style={[styles.tournamentLevel, { color: '#007bff', marginTop: 10, textAlign: 'right', alignSelf: 'flex-end' }]}>
            {tournament.level}
          </Text>
        </View>
         </View>
         {tournament.matches && tournament.matches.length > 0 && (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              <TouchableOpacity onPress={onExpand}>
                {/* Two bold arrows when expanded, one slim arrow when collapsed */}
                {isExpanded ? (
                  <FontAwesome
                    name="angle-up"
                    size={28}
                    color="#E17827"
                    style={{ fontWeight: 'bold' }}
                  />
                ) : (
                  <FontAwesome
                    name="angle-down"
                    size={28}
                    color="#E17827"
                    style={{ fontWeight: 'normal' }}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}

      {isExpanded && tournament.matches && tournament.matches.length > 0 && (
        <View>
          {tournament.matches.map((match) => (
            <View key={match.id}>{renderMatch({ item: match })}</View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
 
  matchMainCard: {
    backgroundColor: '#fff',
    borderRadius: 7,
    padding: 10,
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamLogo1: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  teamName: {
    color: '#000',
    fontSize: 14,
     fontFamily: 'SourceSans3-SemiBold'
  },
  vsText: {
    color: '000',
    fontSize: 12,
    marginHorizontal:2,
    fontFamily: 'SourceSans3-SemiBold'
  },
  vsText1: {
    color: '000',
    fontSize: 14,
    marginHorizontal:2,
     fontFamily: 'SourceSans3-Bold'
  },
  stageBadge: {
    backgroundColor:'#fff',
    borderWidth:1,
    borderRadius: 7,
    padding: 5,
    borderColor:'#E17827'
  },
  stageBadgeText: {
    color: '#E17827',
    fontSize: 12,
    fontFamily: 'SourceSans3-SemiBold'
  },
  teamLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop:4,
  },
  teamLogo: {
    width: 60,
    height: 60,
    marginHorizontal: 20,
  },
  matchDetailsCard: {
   
    borderRadius: 8,
    padding: 10,
    borderColor:'#E17827',
    borderWidth:2
  },
  matchDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    marginVertical: 5,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'SourceSans3-SemiBold',
  },
  detailText1: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'SourceSans3-Bold',
  },
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
  tournamentHeader: { flexDirection: 'row', alignItems: 'center' },
  actionButtons: { flexDirection: 'row' },
  tournamentLogo: { width: 40, height: 40, marginRight: 10 }, 
  tournamentLogo1: { marginRight: 15 },// increased from 20 → 40 to match SVG
  tournamentInfo: { flex: 1 },
  tournamentName: { fontSize: 17, fontFamily: 'SourceSans3-Bold' },
  tournamentSport: { fontSize: 14, color: '#E17827', fontFamily: 'SourceSans3-Regular' },
  tournamentDate: { fontSize: 12, color: 'gray', fontFamily: 'SourceSans3-Regular' },
  tournamentLevel: { fontSize: 12, fontFamily: 'SourceSans3-Regular'},
  expandIcon: { fontSize: 20, color: 'gray', marginLeft: 10 },
  likeIcon: { fontSize: 20, color: 'gray' },
  likedIcon: { color: 'red' },
  matchCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ff7f00',
    borderRadius: 10,
  },
  matchTeams: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  matchDate: { fontSize: 12, color: '#fff' },
  matchTime: { fontSize: 12, color: '#fff' },
  matchVenue: { fontSize: 12, color: '#fff' },
});

export default TournamentCard;
