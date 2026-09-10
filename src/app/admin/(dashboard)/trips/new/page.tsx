import TripForm from "../TripForm";

export default function NewTripPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-black">New Trip</h1>
      <div className="mt-6">
        <TripForm />
      </div>
    </div>
  );
}
