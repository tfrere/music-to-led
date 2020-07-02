import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  return <React.Fragment>{children}</React.Fragment>;
}
