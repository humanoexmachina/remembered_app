import './ImportContactModal.css';

export default function ImportContactModal({ toggleModal }) {
  return (
    <div className="Modal">
      <div onClick={toggleModal} className="overlay"></div>
      <div className="modal-content">
        <div className="columns is-mobile">
          <div className="column"></div>
          <div className="column is-narrow">
            <button className="button" style={{ border: 0 }}>
              <span className="icon">
                <i className="fas fa-times"></i>
              </span>
            </button>
          </div>
        </div>
        Hello world!
      </div>
    </div>
  );
}
