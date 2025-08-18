import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TeamManagementSection } from './TeamManagementSection';
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

const mockTeam = {
  id: 'test-team-id',
  name: 'Test Team',
  founded: 2024,
  stadium: 'Test Stadium',
  capacity: 10000,
  city: 'Test City',
  country: 'Test Country',
  website: 'https://test.com',
  email: 'team@test.com',
  phone: '1234567890',
  description: 'A test team',
  logo_url: 'https://test.com/logo.png',
};

const renderComponent = () => {
  return render(
    <AuthProvider>
      <TeamManagementSection />
    </AuthProvider>
  );
};

describe('TeamManagementSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the useAuth hook
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockReturnValue({ user: mockUser });
  });

  it('should fetch and display team information', async () => {
    mockedApiClient.get.mockResolvedValue({ team: mockTeam });

    renderComponent();

    expect(screen.getByText('Team Management')).toBeInTheDocument();

    // Wait for the loader to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    // Check if team name is displayed
    expect(screen.getByLabelText('Team Name')).toHaveValue(mockTeam.name);
    expect(screen.getByLabelText('Founded')).toHaveValue(mockTeam.founded);
    expect(screen.getByLabelText('Stadium')).toHaveValue(mockTeam.stadium);
  });
});
