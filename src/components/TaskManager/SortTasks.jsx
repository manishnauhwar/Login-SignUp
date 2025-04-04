import { useState, useContext } from "react";
import "./SortTasks.css";
import { FaSort } from "react-icons/fa";
import { ThemeContext } from "../../utils/ThemeContext";

const SortTasks = ({ tasks = [], setTasks, fullData, setFullData }) => {
  const [sortType, setSortType] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filter, setFilter] = useState("None");
  const { theme } = useContext(ThemeContext);

  const priorityOrder = { High: 1, Medium: 2, Low: 3 };

  const handleFilter = (e) => {
    const value = e.target.value;
    setFilter(value);
    console.log(value)
    const filteredTasks =
      value === "None"
        ? fullData
        : fullData.filter((task) => {
          switch (value) {
            case "Completed":
              return task.status === "Completed";
            case "Pending":
              return task.status === "In progress" || task.status === "To Do";
            case "Overdue":
              return task.dueDate && new Date(task.dueDate) > new Date();
            case "High":
            case "Medium":
            case "Low":
              return task.priority === value;
            default:
              return true;
          }
        });
    setTasks(filteredTasks);
  };

  const handleSort = () => {
    if (!sortType) return;
    const sortedTasks = [...tasks].sort((a, b) => {
      let compareValue;
      if (sortType === "priority") {
        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        const dateA = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
        const dateB = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
        compareValue = dateA - dateB;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
    setTasks(sortedTasks);
  };

  return (
    <div className="sort-container" style={{ background: theme.background, color: theme.color }}>
      <select className="filter-select" value={filter} onChange={handleFilter}>
        <option value="None">All Tasks</option>
        <option value="Completed">Completed Tasks</option>
        <option value="Pending">Pending Tasks</option>
        <option value="Overdue">Overdue Tasks</option>
        <option value="High">High Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="Low">Low Priority</option>
      </select>
      <select className="sort-select" onChange={(e) => setSortType(e.target.value)}>
        <option value="">Sort By</option>
        <option value="priority">Priority</option>
        <option value="dueDate">Due Date</option>
      </select>
      <select className="sort-select" onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">ASC</option>
        <option value="desc">DESC</option>
      </select>
      <button className="sort-button" onClick={handleSort} disabled={!sortType}>
        <FaSort /> Sort
      </button>
    </div>
  );
};

export default SortTasks;
