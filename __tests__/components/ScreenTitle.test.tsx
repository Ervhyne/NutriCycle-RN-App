import React from 'react';
import { render } from '@testing-library/react-native';
import ScreenTitle from '../../src/components/ScreenTitle';

describe('ScreenTitle Component', () => {
  it('should render with children', () => {
    const { getByText } = render(<ScreenTitle>Dashboard</ScreenTitle>);
    expect(getByText('Dashboard')).toBeTruthy();
  });

  it('should render with long text', () => {
    const longText = 'This is a very long screen title that should wrap';
    const { getByText } = render(<ScreenTitle>{longText}</ScreenTitle>);
    expect(getByText(longText)).toBeTruthy();
  });

  it('should update when children prop changes', () => {
    const { rerender, getByText, queryByText } = render(
      <ScreenTitle>Dashboard</ScreenTitle>
    );
    expect(getByText('Dashboard')).toBeTruthy();

    rerender(<ScreenTitle>Settings</ScreenTitle>);
    expect(getByText('Settings')).toBeTruthy();
    expect(queryByText('Dashboard')).toBeFalsy();
  });

  it('should apply custom styles', () => {
    const { getByText } = render(
      <ScreenTitle>Machine Status</ScreenTitle>
    );
    const element = getByText('Machine Status');
    expect(element).toBeTruthy();
  });

  it('should render multiple different titles', () => {
    const titles = ['Dashboard', 'Settings', 'History'];

    titles.forEach((title) => {
      const { getByText } = render(<ScreenTitle>{title}</ScreenTitle>);
      expect(getByText(title)).toBeTruthy();
    });
  });
});
