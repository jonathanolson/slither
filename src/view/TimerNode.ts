import { Text, TextOptions } from 'phet-lib/scenery';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { currentTheme, timerFont } from './Theme.ts';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';

export class TimerNode extends Text {
  public constructor(
    public readonly timerProperty: TReadOnlyProperty<number>,
    providedOptions?: TextOptions,
  ) {
    const options = optionize<TextOptions, EmptySelfOptions, TextOptions>()(
      {
        font: timerFont,
        fill: currentTheme.timerColorProperty,
      },
      providedOptions,
    );

    const secondsInAMinute = 60;
    const secondsInAnHour = 60 * secondsInAMinute;
    const secondsInADay = 24 * secondsInAnHour;

    const stringProperty = new DerivedProperty([timerProperty], (time: number) => {
      time = Math.ceil(time);

      const days = Math.floor(time / secondsInADay);
      time -= days * secondsInADay;

      const hours = Math.floor(time / secondsInAnHour);
      time -= hours * secondsInAnHour;

      const minutes = Math.floor(time / secondsInAMinute);
      time -= minutes * secondsInAMinute;

      const seconds = time;

      const hoursString = hours < 10 ? `0${hours}` : `${hours}`;
      const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;

      if (days) {
        return `${days}d ${hoursString}:${minutesString}:${secondsString}`;
      } else if (hours) {
        return `${hoursString}:${minutesString}:${secondsString}`;
      } else {
        return `${minutesString}:${secondsString}`;
      }
    });

    super(stringProperty, options);

    this.disposeEmitter.addListener(() => {
      stringProperty.dispose();
    });

    //
    // const sampleText = new Text( '', {
    //   font: timerFont,
    // } );
    //
    // const measure = ( str: string ): number => {
    //   sampleText.string = str;
    //   return sampleText.width;
    // };
  }
}
