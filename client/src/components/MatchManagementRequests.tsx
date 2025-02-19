import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { PENDING_MATCHES_QUERY } from '../utils/queries.js';
import { UPDATE_MATCH_STATUS } from '../utils/mutations.js';

const MatchManagementRequests: React.FC = () => {
  const dogId = "your-dog-id"; // Need to get this from the app's state or props
  const { loading, error, data } = useQuery(PENDING_MATCHES_QUERY, {
    variables: { dogId },
  });

  const [updateMatchStatus] = useMutation(UPDATE_MATCH_STATUS);

  const handleMatchResponse = async (matchId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await updateMatchStatus({
        variables: { matchId, dogId, status },
        refetchQueries: [{ query: PENDING_MATCHES_QUERY, variables: { dogId } }],
      });
    } catch (err) {
      console.error("Error updating match status:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { getDog } = data;

  return (
    <div>
      <h2>Pending Matches for {getDog.name}</h2>
      {getDog.pendingMatches.map((match: any) => (
        <div key={match.id}>
          <img src={match.dogA.id === dogId ? match.dogB.profilePicture : match.dogA.profilePicture} alt="Dog" />
          <p>{match.dogA.id === dogId ? match.dogB.name : match.dogA.name}</p>
          <button onClick={() => handleMatchResponse(match.id, 'ACCEPTED')}>Accept</button>
          <button onClick={() => handleMatchResponse(match.id, 'REJECTED')}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default MatchManagementRequests;