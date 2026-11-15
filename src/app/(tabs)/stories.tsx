import { router } from 'expo-router';
import { Text } from 'react-native';

import { Body, Button, Card, Screen, Title, styles as ui } from '@/components/ui';
import { steps, stories } from '@/lib/data';

// Stories from people who made it, each linked to the roadmap step it's about.
export default function StoriesScreen() {
  return (
    <Screen>
      <Title>Stories</Title>
      <Body muted>People who walked this road before you.</Body>

      {stories.map((story) => {
        const step = steps.find((s) => s.storyId === story.id);
        return (
          <Card key={story.id}>
            <Text style={ui.small}>
              {story.isSample ? 'EXAMPLE STORY' : 'SOMEONE WHO MADE IT'}
              {step ? ` · ${step.title.toUpperCase()}` : ''}
            </Text>
            <Body>"{story.text}"</Body>
            <Body muted>— {story.name}</Body>
            {step && (
              <Button
                label={`${step.emoji} See this step →`}
                variant="secondary"
                onPress={() => router.push(`/step/${step.id}`)}
              />
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
