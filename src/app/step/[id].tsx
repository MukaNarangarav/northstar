import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Body, Button, Card, ResourceCard, Screen, Title, styles as ui } from '@/components/ui';
import { getResource, getStep, getStory } from '@/lib/data';
import { useProfile } from '@/lib/profile';
import { isDone } from '@/lib/roadmap';

export default function StepScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { answers, completed, completeStep, undoStep } = useProfile();
  const [celebrate, setCelebrate] = useState(false);

  const step = getStep(id);
  if (!step || !answers) return <Screen><Body>Step not found.</Body></Screen>;

  const done = isDone(step, answers, completed);
  const story = getStory(step.storyId);

  // Celebration screen after marking a step complete.
  if (celebrate) {
    return (
      <Screen>
        <Text style={{ fontSize: 72, textAlign: 'center', marginTop: 60 }}>🎉</Text>
        <Title>{step.celebration}</Title>
        <Button label="See my next step →" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>
        {step.emoji} {step.title}
      </Title>
      <Body muted>{step.plainTitle}</Body>

      <Card>
        <Text style={ui.small}>WHY THIS MATTERS</Text>
        <Body>{step.why}</Body>
      </Card>

      <Card>
        <Text style={ui.small}>WHAT TO DO</Text>
        {step.tasks.map((t, i) => (
          <Body key={i}>
            {i + 1}. {t}
          </Body>
        ))}
      </Card>

      <Text style={ui.small}>PLACES THAT CAN HELP</Text>
      {step.resourceIds.map((rid) => {
        const r = getResource(rid);
        return r ? <ResourceCard key={rid} resource={r} /> : null;
      })}

      {story && (
        <Card>
          <Text style={ui.small}>{story.isSample ? 'EXAMPLE STORY' : 'SOMEONE WHO MADE IT'}</Text>
          <Body>"{story.text}"</Body>
          <Body muted>— {story.name}</Body>
        </Card>
      )}

      {done ? (
        <>
          <Body muted>✅ You've finished this step.</Body>
          {completed.includes(step.id) && (
            <Button label="Undo" variant="secondary" onPress={() => undoStep(step.id)} />
          )}
        </>
      ) : (
        <Button
          label="I did it! Mark complete"
          onPress={() => {
            completeStep(step.id);
            setCelebrate(true);
          }}
        />
      )}
    </Screen>
  );
}
