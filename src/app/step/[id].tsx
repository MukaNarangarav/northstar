import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Body, Button, Card, Checklist, Label, ResourceCard, Screen, Title } from '@/components/ui';
import { getResource, getStep, getStory } from '@/lib/data';
import { useProfile } from '@/lib/profile';
import { buildRoadmap } from '@/lib/roadmap';

export default function StepScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { answers, completed, checks, completeStep, undoStep, toggleCheck } = useProfile();
  const [celebrate, setCelebrate] = useState(false);

  const step = getStep(id);
  if (!step || !answers) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Step not found' }} />
        <Body>We couldn't find that step.</Body>
        <Button label="Go to my roadmap" onPress={() => router.replace('/roadmap')} />
      </Screen>
    );
  }

  const items = buildRoadmap(answers, completed);
  const status = items.find((i) => i.step.id === step.id)!.status;
  const story = getStory(step.storyId);
  const listId = `step:${step.id}`;
  const missing = step.requires.filter(
    (rid) => items.find((i) => i.step.id === rid)?.status !== 'done',
  );

  // Celebration screen after marking a step complete.
  if (celebrate) {
    const next = items.find((i) => i.status === 'next');
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Step complete' }} />
        <Text style={{ fontSize: 72, textAlign: 'center', marginTop: 60 }}>🎉</Text>
        <Title>{step.celebration}</Title>
        {next ? (
          <Button
            label={`Next: ${next.step.emoji} ${next.step.title} →`}
            onPress={() => router.replace(`/step/${next.step.id}`)}
          />
        ) : (
          <Body>🏠 That was the last step. You made it to Home Base!</Body>
        )}
        <Button label="Back to my roadmap" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: step.title }} />
      <Title>
        {step.emoji} {step.title}
      </Title>
      <Body muted>{step.plainTitle}</Body>

      {status === 'locked' && (
        <Card>
          <Label>🔒 COMING UP</Label>
          <Body>
            Finish{' '}
            {missing
              .map((rid) => getStep(rid)?.title)
              .filter(Boolean)
              .join(' and ')}{' '}
            first. Here's a preview of what this step involves.
          </Body>
        </Card>
      )}

      <Card>
        <Label>WHY THIS MATTERS</Label>
        <Body>{step.why}</Body>
      </Card>

      <Card>
        <Label>{status === 'locked' ? 'WHAT YOU WILL DO' : 'WHAT TO DO (TAP TO CHECK OFF)'}</Label>
        <Checklist
          items={step.tasks}
          checked={checks[listId] ?? []}
          onToggle={status === 'locked' ? undefined : (t) => toggleCheck(listId, t)}
          numbered
        />
      </Card>

      <Label>PLACES THAT CAN HELP</Label>
      {step.resourceIds.map((rid) => {
        const r = getResource(rid);
        return r ? <ResourceCard key={rid} resource={r} /> : null;
      })}

      {story && (
        <Card>
          <Label>{story.isSample ? 'EXAMPLE STORY' : 'SOMEONE WHO MADE IT'}</Label>
          <Body>"{story.text}"</Body>
          <Body muted>— {story.name}</Body>
        </Card>
      )}

      {status === 'done' ? (
        <>
          <Body muted>✅ You've finished this step.</Body>
          {completed.includes(step.id) && (
            <Button label="Undo" variant="secondary" onPress={() => undoStep(step.id)} />
          )}
        </>
      ) : status !== 'locked' ? (
        <Button
          label="I did it! Mark complete"
          onPress={() => {
            completeStep(step.id);
            setCelebrate(true);
          }}
        />
      ) : null}
    </Screen>
  );
}
