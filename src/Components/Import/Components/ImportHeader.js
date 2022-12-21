import 'bulma/css/bulma.min.css';

export default function ImportHeader({ children }) {
  return (
    <div className="block mt-5">
      <h1 className="title">{children}</h1>
    </div>
  );
}
