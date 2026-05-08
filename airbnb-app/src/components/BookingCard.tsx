type BookingCardProps = {
  title?: string;
};

export default function BookingCard({ title = "Booking" }: BookingCardProps) {
  return <article className="card">{title}</article>;
}
