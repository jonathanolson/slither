export enum Lbool {
  TRUE = 0,
  FALSE = 1,
  UNDEF = 2
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Lbool {
  export function valueOf( value: number ): Lbool {
    switch ( value ) {
      case 0:
        return Lbool.TRUE;
      case 1:
        return Lbool.FALSE;
      case 2:
        return Lbool.UNDEF;
      default:
        throw new Error( 'IllegalArgumentException: value' );
    }
  }

  export function valueOfBoolean( x: boolean ): Lbool {
    return x ? Lbool.TRUE : Lbool.FALSE;
  }

  const XOR: Lbool[][] = [
    [ Lbool.FALSE, Lbool.TRUE ],
    [ Lbool.TRUE, Lbool.FALSE ],
    [ Lbool.UNDEF, Lbool.UNDEF ]
  ];

  export function xor( self: Lbool, o: boolean ): Lbool {
    return XOR[ self ][ o ? 1 : 0 ];
  }

  const AND: Lbool[][] = [
    [ Lbool.TRUE, Lbool.FALSE, Lbool.UNDEF ],
    [ Lbool.FALSE, Lbool.FALSE, Lbool.FALSE ],
    [ Lbool.UNDEF, Lbool.FALSE, Lbool.UNDEF ]
  ];

  export function and( self: Lbool, o: Lbool ): Lbool {
    return AND[ self ][ o ];
  }

  const OR: Lbool[][] = [
    [ Lbool.TRUE, Lbool.TRUE, Lbool.TRUE ],
    [ Lbool.TRUE, Lbool.FALSE, Lbool.UNDEF ],
    [ Lbool.TRUE, Lbool.UNDEF, Lbool.UNDEF ]
  ];

  export function or( self: Lbool, o: Lbool ): Lbool {
    return OR[ self ][ o ];
  }
}
