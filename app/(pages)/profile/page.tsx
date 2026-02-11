import ProfileContent from "@/components/profile-content";
import ProfileHeader from "@/components/profile-header";

function page() {
  return (
    <div className="flex flex-col gap-4">
      <ProfileHeader />
      <ProfileContent />
    </div>
  );
}

export default page;
