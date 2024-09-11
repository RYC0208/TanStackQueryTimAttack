import React, { useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const App = () => {
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostViews, setNewPostsViews] = useState(0);

  const queryClient = useQueryClient();

  const getPosts = async () => {
    const { data } = await axios.get("http://localhost:4000/posts");
    return data;
  };

  const getComments = async () => {
    const { data } = await axios.get("http://localhost:4000/comments");
    return data;
  };

  const {
    data: comments,
    CommentsError,
    CommentIsLoading,
  } = useQuery({
    queryKey: ["comments"],
    queryFn: getComments,
  });

  const {
    data: posts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const addComment = async (newComment) => {
    const { data } = await axios.post(
      "http://localhost:4000/comments",
      newComment
    );
    return data;
  };

  const addPost = async (newPost) => {
    const { data } = await axios.post("http://localhost:4000/posts", newPost);
    return data;
  };

  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
    },
  });

  const postMutation = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handlePostSubmit = (e) => {
    e.preventDefault();
    postMutation.mutate({ title: newPostTitle, views: newPostViews });
    setNewPostTitle("");
    setNewPostsViews(0);
  };

  const [newCommentText, setNewCommentText] = useState("");
  const [CommentPostId, setCommentPostId] = useState(0);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    commentMutation.mutate({ text: newCommentText, postId: CommentPostId });
    setNewCommentText("");
    setCommentPostId(null);
  };
  if (isLoading) return <div>로딩중..</div>;
  if (error) return <div>에러!!!!{error.message}</div>;

  console.log(CommentPostId);
  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h1>제목:{post.title}</h1>
            <p>조회수:{post.views}</p>

            <h3>댓글 리스트</h3>
            {CommentIsLoading ? (
              <div>로딩중</div>
            ) : (
              comments
                .filter((comment) => comment.postId === post.id)
                .map((comment) => (
                  <div key={comment.id}>
                    <p>
                      {comment.id}: {comment.text}
                    </p>
                  </div>
                ))
            )}
            <form onSubmit={handleCommentSubmit}>
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => {
                  setNewCommentText(e.target.value);
                  setCommentPostId(post.id);
                }}
              />
              <button type="submit">댓글 추가</button>
            </form>
          </li>
        ))}
      </ul>

      <form onSubmit={handlePostSubmit}>
        <input
          type="text"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
        />
        <input
          type="number"
          value={newPostViews}
          onChange={(e) => setNewPostsViews(e.target.value)}
        />
        <button type="submit">추가</button>
      </form>
    </div>
  );
};

export default App;
