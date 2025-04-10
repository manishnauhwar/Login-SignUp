import { useState, useContext } from "react";
import "./SortTasks.css";
import { FaSort } from "react-icons/fa";
import { ThemeContext } from "../../utils/ThemeContext";
import { LanguageContext } from "../../utils/LanguageContext";

const SortTasks = ({ tasks = [], setTasks, fullData, setFullData }) => {
  const [sortType, setSortType] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filter, setFilter] = useState("all");
  const { theme } = useContext(ThemeContext);
  const { translate } = useContext(LanguageContext);

  const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };

  const handleFilter = (e) => {
    const value = e.target.value;
    setFilter(value);
    const filteredTasks =
      value === "all"
        ? fullData
        : fullData.filter((task) => {
          switch (value) {
            case "completed":
              return task.status === "Completed";
            case "pending":
              return task.status === "In progress" || task.status === "To Do";
            case "overdue":
              return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
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
        <option value="all">{translate("allTasks")}</option>
        <option value="completed">{translate("completedTasksFilter")}</option>
        <option value="pending">{translate("pendingTasksFilter")}</option>
        <option value="overdue">{translate("overdueTasksFilter")}</option>
        <option value="High">{translate("highPriority")}</option>
        <option value="Medium">{translate("mediumPriority")}</option>
        <option value="Low">{translate("lowPriority")}</option>
      </select>
      <select className="sort-select" onChange={(e) => setSortType(e.target.value)}>
        <option value="">{translate("sortBy")}</option>
        <option value="priority">{translate("priority")}</option>
        <option value="dueDate">{translate("dueDate")}</option>
      </select>
      <select className="sort-select" onChange={(e) => setSortOrder(e.target.value)}>
        <option value="asc">{translate("ascending")}</option>
        <option value="desc">{translate("descending")}</option>
      </select>
      <button className="sort-button" onClick={handleSort} disabled={!sortType}>
        <FaSort /> {translate("sort")}
      </button>
    </div>
  );
};

export default SortTasks;
