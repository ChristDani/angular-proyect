export interface IButtonsInFooter {
  primaryButton: IButton;
  secondaryButtons: Array<IButton>;
}

export interface IButton {
  text: string;
  action: () => void;
  disabled: boolean;
}