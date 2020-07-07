import React from 'react';
import Builder from '../components/Builder';
import ScrollArea from 'react-scrollbar';

export default function BuilderPage() {
  return (
    <ScrollArea
      speed={0.8}
      className="page page--builder"
      contentClassName="content"
      horizontal={false}
    >
      <Builder />
    </ScrollArea>
  );
}
