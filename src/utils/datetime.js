Number.prototype.padLeft = function (base, chr) {
  var len = String(base || 10).length - String(this).length + 1;
  return len > 0 ? new Array(len).join(chr || "0") + this : this;
};

const currDatetime = () => {
  const d = new Date();
  const dformat =
    [d.getFullYear(), (d.getMonth() + 1).padLeft(), d.getDate().padLeft()].join(
      "-"
    ) +
    " " +
    [
      d.getHours().padLeft(),
      d.getMinutes().padLeft(),
      d.getSeconds().padLeft(),
    ].join(":");
  return dformat;
};

const currDate = () => {
  const d = new Date();
  const dformat = [
    d.getFullYear(),
    (d.getMonth() + 1).padLeft(),
    d.getDate().padLeft(),
  ].join("-");
  return dformat;
};

const yesterdayDate = () => {
  let date = new Date();
  date.setDate(date.getDate() - 1);
  const dformat = [
    date.getFullYear(),
    (date.getMonth() + 1).padLeft(),
    date.getDate().padLeft(),
  ].join("-");
  return dformat;
};

module.exports = { currDatetime, currDate, yesterdayDate };
