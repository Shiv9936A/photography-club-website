import PropTypes from "prop-types";
import { MessageSquare } from "lucide-react";

function CommentSection({ comments }) {
  return (
    <section className="rounded-[12px] border border-secondary bg-complementPrimary p-5">
      <h2 className="mb-4 font-playfair text-3xl font-medium">Comments Preview</h2>
      <div className="flex flex-col gap-3">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded-[12px] bg-complementSecondary p-4">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <MessageSquare size={18} />
              {comment.name}
            </div>
            <p className="text-sm text-quaternary">{comment.text}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        {/* TODO: GET Comments API */}
        <input
          type="text"
          placeholder="Write a comment..."
          className="w-full rounded-full border border-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Write a comment"
        />
        <button
          type="button"
          disabled
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-complementPrimary opacity-50"
        >
          Post
        </button>
      </div>
    </section>
  );
}

CommentSection.propTypes = {
  comments: PropTypes.array.isRequired,
};

export default CommentSection;
