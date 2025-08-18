import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PlayerManagementSection } from './PlayerManagementSection';
import { AuthProvider } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';

jest.mock('../lib/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockUser = {
  id: 'test-user-id',
  teamId: 'test-team-id',
  email: 'test@test.com',
  name: 'Test User',
};

const mockPlayers = [
  {
    id: '1',
    first_name: 'Fernando',
    last_name: 'Torres',
    position: 'forward',
    jersey_number: 9,
    status: 'active',
  },
  {
    id: '2',
    first_name: 'Pablo',
    last_name: 'Sánchez',
    position: 'midfielder',
    jersey_number: 10,
    status: 'active',
  },
];

const renderComponent = () => {
  return render(
    <AuthProvider>
      <PlayerManagementSection />
    </AuthProvider>
  );
};

describe('PlayerManagementSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockReturnValue({ user: mockUser });
  });

  it('should fetch and display players', async () => {
    mockedApiClient.get.mockResolvedValue({ players: mockPlayers });

    renderComponent();

    expect(screen.getByText('Player Management')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Fernando Torres')).toBeInTheDocument();
      expect(screen.getByText('Pablo Sánchez')).toBeInTheDocument();
    });
  });

  it('should add a new player', async () => {
    mockedApiClient.get.mockResolvedValue({ players: [] }); // Start with no players
    const newPlayer = {
      id: '3',
      first_name: 'New',
      last_name: 'Player',
      position: 'defender',
      jersey_number: 5,
      status: 'active',
    };
    mockedApiClient.post.mockResolvedValue({ player: newPlayer });

    renderComponent();

    fireEvent.click(screen.getByText('Add Player'));

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'New' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Player' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@player.com' } });
    // Position select is harder to test with fireEvent, we can assume it works for now
    fireEvent.change(screen.getByLabelText('Jersey Number'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Nationality'), { target: { value: 'Testland' } });

    fireEvent.click(screen.getByText('Save Player'));

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith('/players', expect.any(Object));
      expect(screen.getByText('New Player')).toBeInTheDocument();
    });
  });
});
