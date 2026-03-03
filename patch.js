const fs = require('fs');

const html = `
    <!-- Modals -->
    <div id="modal-update" class="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
            <div class="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
                <h3 id="modalUpdateTitle" class="text-xl font-black text-navy uppercase tracking-tight">Add New Update</h3>
                <button type="button" class="closeModalBtn p-2 hover:bg-gray-100 rounded-xl text-gray-400">X</button>
            </div>
            <form id="updateForm" class="p-8 space-y-6">
                <input type="hidden" id="updateEditId" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div><label>Title</label><input required id="uTitle" class="w-full border p-2 rounded" /></div>
                    <div><label>Category</label><input required id="uCat" class="w-full border p-2 rounded" /></div>
                    <div><label>Date</label><input type="date" required id="uDate" class="w-full border p-2 rounded" /></div>
                    <div><label>Tags</label><input id="uTags" class="w-full border p-2 rounded" /></div>
                    <div><label>Link</label><input type="url" id="uLink" class="w-full border p-2 rounded" /></div>
                    <div><label>Reg Link</label><input type="url" id="uRegLink" class="w-full border p-2 rounded" /></div>
                    <div class="sm:col-span-2"><label>Description</label><textarea id="uDesc" class="w-full border p-2 rounded"></textarea></div>
                </div>
                <div class="flex justify-end gap-4"><button type="submit" class="bg-navy text-white px-6 py-2 rounded">Save</button></div>
            </form>
        </div>
    </div>

    <div id="modal-deadline" class="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
                <h3 id="modalDeadlineTitle" class="text-xl font-black text-navy uppercase tracking-tight">Add New Deadline</h3>
                <button type="button" class="closeModalBtn p-2 hover:bg-gray-100 rounded-xl text-gray-400">X</button>
            </div>
            <form id="deadlineForm" class="p-8 space-y-6">
                <input type="hidden" id="deadlineEditId" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div><label>Name</label><input required id="dName" class="w-full border p-2 rounded" /></div>
                    <div><label>Date/Time</label><input type="datetime-local" required id="dDate" class="w-full border p-2 rounded" /></div>
                    <div><label>Status</label><input required id="dStatus" class="w-full border p-2 rounded" /></div>
                    <div><label>Link</label><input type="url" id="dLink" class="w-full border p-2 rounded" /></div>
                </div>
                <div class="flex justify-end gap-4"><button type="submit" class="bg-navy text-white px-6 py-2 rounded">Save</button></div>
            </form>
        </div>
    </div>

    <div id="modal-resource" class="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
                <h3 id="modalResourceTitle" class="text-xl font-black text-navy uppercase tracking-tight">Add New Resource</h3>
                <button type="button" class="closeModalBtn p-2 hover:bg-gray-100 rounded-xl text-gray-400">X</button>
            </div>
            <form id="resourceForm" class="p-8 space-y-6">
                <input type="hidden" id="resourceEditId" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div><label>Name</label><input required id="rName" class="w-full border p-2 rounded" /></div>
                    <div><label>Type</label><input required id="rType" class="w-full border p-2 rounded" /></div>
                    <div><label>Size</label><input id="rSize" class="w-full border p-2 rounded" /></div>
                </div>
                <div class="flex justify-end gap-4"><button type="submit" class="bg-navy text-white px-6 py-2 rounded">Save</button></div>
            </form>
        </div>
    </div>

    <div id="modal-link" class="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
                <h3 id="modalLinkTitle" class="text-xl font-black text-navy uppercase tracking-tight">Add New Link</h3>
                <button type="button" class="closeModalBtn p-2 hover:bg-gray-100 rounded-xl text-gray-400">X</button>
            </div>
            <form id="linkForm" class="p-8 space-y-6">
                <input type="hidden" id="linkEditId" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div><label>Label</label><input required id="lLabel" class="w-full border p-2 rounded" /></div>
                    <div><label>URL</label><input type="url" required id="lUrl" class="w-full border p-2 rounded" /></div>
                    <div><label>Category</label><input required id="lCat" class="w-full border p-2 rounded" /></div>
                    <div class="sm:col-span-2"><label>Description</label><textarea id="lDesc" class="w-full border p-2 rounded"></textarea></div>
                </div>
                <div class="flex justify-end gap-4"><button type="submit" class="bg-navy text-white px-6 py-2 rounded">Save</button></div>
            </form>
        </div>
    </div>
`;

let content = fs.readFileSync('public/admin.html', 'utf8');
const startIdx = content.indexOf('<!-- Modal Backdrop -->');
const endIdx = content.indexOf('<!-- Notifications Toast -->');

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    fs.writeFileSync('public/admin.html', before + html + after);
    console.log('Successfully patched admin.html');
} else {
    console.log('Could not find injection points');
}
