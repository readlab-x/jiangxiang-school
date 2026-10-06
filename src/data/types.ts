export interface Segment {
  no: number;
  text: string;
  note: string;
  tag?: string;
}

export interface BookMeta {
  title: string;
  romanization: string;
  nature: string;
  role: string;
}
